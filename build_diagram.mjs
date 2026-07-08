import { Diagram } from "file:///E:/Antigravity/drawio-ai-kit-main/src/builder.mjs";
import { group, frame, icon, box, renderTree, stage } from "file:///E:/Antigravity/drawio-ai-kit-main/src/layout-engine.mjs";
import fs from "fs";

// Khởi tạo sơ đồ kiến trúc dạng luồng (pipeline) để các khối chạy từ trái sang phải
const d = new Diagram("pipeline");

// Cấu trúc sơ đồ được phân rã thành các layer chi tiết và khoa học
const tree = frame("root", "", { dir: "row", align: "center", gap: 60 }, [
    
    // Lớp người dùng
    group("users", "", "Người dùng", { dir: "col", gap: 20, padding: 30 }, [
        box("rm_user", "Relationship Manager\n(RM)")
    ]),

    // Lớp ứng dụng frontend (Giao tiếp)
    group("frontend_layer", "group_aws_cloud_alt", "Frontend (Client)", { dir: "col", gap: 30, padding: 30 }, [
        box("web_ui", "Web Chat Interface\n(React/Vite)"),
        box("quick_actions", "Nút thao tác nhanh\n(Quick Actions)")
    ]),

    // Lớp Backend AI Orchestrator (Xử lý logic & AI)
    group("backend_layer", "group_vpc", "Backend Orchestrator (FastAPI)", { dir: "col", gap: 40, padding: 40 }, [
        box("langchain_router", "LangChain/LangGraph\n(Điều phối logic)"),
        frame("ai_core", "", { dir: "row", gap: 20 }, [
            icon("llm_engine", "openai", "LLM Engine\n(OpenAI/Claude)"),
            box("memory", "Chat Memory\n(Lịch sử hội thoại)")
        ])
    ]),

    // Lớp tích hợp dữ liệu (MCP)
    group("mcp_layer", "group_ecs", "Data Integration Layer", { dir: "col", gap: 30, padding: 40 }, [
        box("mcp_server", "MCP Server (FastMCP)\nQuản lý Context"),
        group("mcp_tools", "group_subnet", "MCP Tools (Công cụ)", { dir: "col", gap: 20, padding: 20 }, [
            box("tool_profile", "get_customer_profile"),
            box("tool_opps", "get_opportunities"),
            box("tool_email", "draft_email")
        ])
    ]),

    // Lớp hệ thống ngân hàng thực tế (Mock API Sandbox)
    group("bank_systems", "group_corporate_data_center", "Bank A Systems (Sandbox)", { dir: "col", gap: 30, padding: 40 }, [
        box("crm_customers", "Hồ sơ Khách hàng\n(Sandbox DB)"),
        box("crm_opps", "Cơ hội Bán hàng\n(Cross-sell DB)")
    ])
]);

// Gọi engine để tự động tính toán tọa độ và gắn component
renderTree(d, tree);

// ĐỊNH NGHĨA LUỒNG DỮ LIỆU (EDGES)

// 1. Tương tác của người dùng với Frontend
d.link("rm_user", "web_ui", "Nhập câu hỏi bằng văn bản");
d.link("rm_user", "quick_actions", "Click thao tác có sẵn");
d.link("quick_actions", "web_ui", "Kích hoạt lệnh");

// 2. Frontend gọi Backend
d.link("web_ui", "langchain_router", "Gửi tin nhắn (REST API POST /chat)");

// 3. Logic nội bộ Backend (AI Orchestration)
d.link("langchain_router", "memory", "Truy xuất lịch sử", { dashed: true });
d.link("memory", "langchain_router", "Trả ngữ cảnh cũ", { dashed: true });
d.link("langchain_router", "llm_engine", "Truyền Prompt + Context");
d.link("llm_engine", "langchain_router", "Quyết định gọi Tool");

// 4. Giao tiếp Backend -> MCP Server
d.link("langchain_router", "mcp_server", "Yêu cầu Tool qua chuẩn MCP");

// 5. MCP Server điều hướng Tool
d.link("mcp_server", "tool_profile", "");
d.link("mcp_server", "tool_opps", "");
d.link("mcp_server", "tool_email", "");

// 6. MCP Server truy xuất hệ thống ngân hàng
d.link("tool_profile", "crm_customers", "HTTP GET /customers");
d.link("tool_opps", "crm_opps", "HTTP GET /opportunities");

// 7. Chiều dữ liệu trả về (Mũi tên đứt nét thể hiện response data)
d.link("crm_customers", "tool_profile", "Data JSON", { dashed: true });
d.link("crm_opps", "tool_opps", "Data JSON", { dashed: true });
d.link("tool_email", "mcp_server", "Bản nháp", { dashed: true });
d.link("mcp_server", "langchain_router", "Trả kết quả Tool", { dashed: true });
d.link("llm_engine", "langchain_router", "Sinh phản hồi cuối cùng", { dashed: true });
d.link("langchain_router", "web_ui", "Trả lời chat", { dashed: true });

// Xuất file bản vẽ kiến trúc
const PROJECT = "E:/Antigravity/CRM-App";
fs.writeFileSync(`${PROJECT}/Architecture_CRM_Agent_Detailed.drawio`, d.mxfile("Kiến trúc Chi tiết AI Agent CRM"));
console.log("Đã tạo thành công file sơ đồ chi tiết: Architecture_CRM_Agent_Detailed.drawio");
