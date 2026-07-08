from mcp.server.fastmcp import FastMCP

# Create an MCP server
mcp = FastMCP("CRM-Mock-Server")

# Mock data
CUSTOMERS = {
    "KH001": {"name": "Nguyễn Văn An", "phone": "0901234567", "balance": 50000000, "segment": "VIP"},
    "KH002": {"name": "Trần Thị Bình", "phone": "0912345678", "balance": 12000000, "segment": "Mass"}
}

OPPORTUNITIES = {
    "KH001": [{"type": "Bảo hiểm nhân thọ", "probability": 0.8, "status": "Mở"}],
    "KH002": [{"type": "Thẻ tín dụng", "probability": 0.5, "status": "Đang tư vấn"}]
}

@mcp.tool()
def get_customer_profile(customer_id: str) -> str:
    """Lấy thông tin hồ sơ khách hàng dựa vào mã khách hàng (vd: KH001)."""
    if customer_id in CUSTOMERS:
        return str(CUSTOMERS[customer_id])
    return "Không tìm thấy khách hàng."

@mcp.tool()
def get_opportunities(customer_id: str) -> str:
    """Lấy danh sách cơ hội bán hàng (Opportunity) của một khách hàng."""
    if customer_id in OPPORTUNITIES:
        return str(OPPORTUNITIES[customer_id])
    return "Không tìm thấy cơ hội bán hàng nào."

@mcp.tool()
def draft_email(customer_name: str, product_type: str) -> str:
    """Soạn thảo email giới thiệu sản phẩm cho khách hàng."""
    return f"Kính gửi {customer_name},\n\nNgân hàng A xin giới thiệu sản phẩm {product_type} phù hợp với nhu cầu tài chính của quý khách.\n\nTrân trọng,\nBank A"

@mcp.tool()
def send_email(customer_id: str, to_email: str, subject: str, body: str) -> str:
    """Gửi email cho khách hàng từ CRM/email gateway."""
    import sys
    if customer_id not in CUSTOMERS:
        return f"Lỗi: Không tìm thấy khách hàng {customer_id} trong CRM."
    
    # Simulate sending the email safely by printing to stderr
    print(f"[Email Gateway] Đang gửi email tới {to_email} (Khách hàng: {customer_id})", file=sys.stderr)
    print(f"Tiêu đề: {subject}", file=sys.stderr)
    print(f"Nội dung:\n{body}", file=sys.stderr)
    
    customer_name = CUSTOMERS[customer_id]["name"]
    return f"Đã gửi email thành công tới {to_email} cho khách hàng {customer_name} ({customer_id})."

if __name__ == "__main__":
    mcp.run()
