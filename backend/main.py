from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import json
import asyncio
from dotenv import load_dotenv

from mcp.client.stdio import stdio_client, StdioServerParameters
from mcp.client.session import ClientSession
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage
from langgraph.prebuilt import create_react_agent
from langchain_core.tools import tool

load_dotenv(override=True)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

# Lịch sử hội thoại (Memory in-memory đơn giản cho Demo)
chat_history = []

# Cấu hình để chạy MCP Server như một tiến trình con
# Dùng đường dẫn tuyệt đối để hoạt động đúng trên cả local lẫn Railway
_backend_dir = os.path.dirname(os.path.abspath(__file__))
_mcp_server_path = os.path.join(_backend_dir, "..", "mcp-server", "main.py")

server_params = StdioServerParameters(
    command="python",
    args=[_mcp_server_path]
)

@app.get("/health")
async def health_check():
    base_url = os.getenv("OPENAI_API_BASE", "NOT SET")
    has_key = bool(os.getenv("OPENAI_API_KEY"))
    mcp_exists = os.path.exists(_mcp_server_path)
    return {
        "status": "ok",
        "llm_base_url": base_url,
        "has_api_key": has_key,
        "mcp_server_path": _mcp_server_path,
        "mcp_server_exists": mcp_exists,
    }


@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    global chat_history
    user_msg = request.message
    
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return {
            "reply": "Hệ thống chưa được cấu hình API Key. Hãy điền OPENAI_API_KEY vào file backend/.env để LLM có thể hoạt động.", 
            "context": "Thiếu API Key"
        }

    chat_history.append(HumanMessage(content=user_msg))

    try:
        # Khởi tạo kết nối tới MCP Server qua STDIO
        async with stdio_client(server_params) as (read, write):
            async with ClientSession(read, write) as session:
                await session.initialize()
                
                # 1. Lấy danh sách các Tools khả dụng từ MCP Server (FastMCP)
                mcp_tools_resp = await session.list_tools()
                tools_desc = "\n".join([f"- **{t.name}**: {t.description}\n  Schema: {json.dumps(t.inputSchema)}" for t in mcp_tools_resp.tools])
                
                # 2. Xây dựng một LangChain Tool tổng làm cầu nối (Proxy Tool)
                @tool
                async def execute_crm_tool(tool_name: str, arguments_json: str) -> str:
                    """Dùng công cụ này để gọi hệ thống CRM Bank A. Truyền tên tool vào `tool_name` và tham số vào `arguments_json` (định dạng chuỗi JSON)."""
                    try:
                        args = json.loads(arguments_json)
                        result = await session.call_tool(tool_name, arguments=args)
                        # Extract text from MCP Tool response
                        texts = [getattr(c, "text", str(c)) for c in result.content]
                        return "\n".join(texts)
                    except Exception as e:
                        return f"Lỗi khi gọi tool {tool_name}: {str(e)}"
                
                # 3. Khởi tạo LLM & Agent (dùng kr/claude-haiku-4.5 qua 9router Kiro AI free)
                llm = ChatOpenAI(
                    model="kr/claude-haiku-4.5", 
                    temperature=0,
                    api_key=os.getenv("OPENAI_API_KEY"),
                    base_url=os.getenv("OPENAI_API_BASE", "http://localhost:20128/v1")
                )
                
                system_message = f"""Bạn là trợ lý AI Co-Pilot cho Relationship Manager của Bank A.
Hãy trả lời bằng tiếng Việt chuyên nghiệp, ngắn gọn. Bạn ĐƯỢC PHÉP và NÊN dùng công cụ `execute_crm_tool` để truy vấn dữ liệu từ CRM.
Danh sách các tính năng CRM bạn có thể gọi thông qua `execute_crm_tool`:
{tools_desc}
Lưu ý: Luôn gọi tool nếu câu hỏi liên quan đến khách hàng, không được tự bịa dữ liệu.
"""
                
                agent_executor = create_react_agent(llm, tools=[execute_crm_tool], prompt=system_message)
                
                # 4. Chạy Agent với lịch sử
                result = await agent_executor.ainvoke({"messages": chat_history})
                
                ai_response = result["messages"][-1].content
                chat_history.append(AIMessage(content=ai_response))
                
                # Lấy tên các tool đã được gọi trong lượt này để làm Context Badge
                used_tools = [m.name for m in result["messages"] if m.type == "tool"]
                context_str = ", ".join(used_tools) if used_tools else None
                
                return {"reply": ai_response, "context": f"MCP Tools: {context_str}" if context_str else None}

    except Exception as e:
        import traceback
        traceback.print_exc()
        # Unwrap ExceptionGroup (Python 3.11+) to show actual error
        actual_error = e
        if hasattr(e, 'exceptions') and e.exceptions:
            actual_error = e.exceptions[0]
            # Unwrap nested ExceptionGroups
            while hasattr(actual_error, 'exceptions') and actual_error.exceptions:
                actual_error = actual_error.exceptions[0]
        error_msg = str(actual_error)
        return {"reply": f"Lỗi hệ thống AI: {error_msg}", "context": "Error"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
