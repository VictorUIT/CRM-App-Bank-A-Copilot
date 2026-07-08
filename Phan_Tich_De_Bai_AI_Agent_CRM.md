# Phân tích Đề bài Challenge #16: AI Agents cho CRM

**Sự kiện:** Vietnam Innovation Challenge 2026
**Đơn vị ra đề:** Ngân hàng TMCP A

## 1. Bối cảnh và Nỗi đau (Pain-point)
* **Vấn đề:** Các Relationship Manager (RM - Quản lý quan hệ khách hàng) đang bị quá tải. Họ phải chăm sóc 50-80 khách hàng/ngày và mất 2-3 tiếng chỉ để làm các việc thủ công: tra cứu thông tin khách hàng, soạn email follow-up, chuẩn bị kịch bản gọi điện (call script).
* **Giải pháp thị trường:** Các công cụ như Salesforce Einstein hay Copilot for Sales chi phí quá cao, không am hiểu nghiệp vụ ngân hàng Việt Nam và tiếng Việt.
* **Cơ hội:** Hệ thống CRM của Bank A đã có sẵn kiến trúc API-first. Bài toán đặt ra là xây dựng một **AI Co-pilot (trợ lý ảo) giao tiếp bằng tiếng Việt**, tích hợp thẳng vào CRM để tự động hóa các tác vụ trên.

## 2. Điểm mấu chốt về Công nghệ: Model Context Protocol (MCP)
Đề bài nhấn mạnh rất mạnh vào **MCP**. Đây là yếu tố cốt lõi để ăn điểm:
* Yêu cầu Agent không chỉ đơn thuần là một chatbot hỏi - đáp, mà phải là một hệ thống có khả năng **luân chuyển mượt mà (seamless context switching)** giữa các hệ thống dữ liệu khác nhau của CRM (Ví dụ: Đang hỏi thông tin cá nhân khách hàng -> chuyển sang xem lịch sử mua bảo hiểm -> tạo email chào mời khoản vay mới) mà **không bị quên hoặc mất ngữ cảnh**.
* Kiến trúc đòi hỏi bạn phải viết một **MCP Server** đóng vai trò làm cầu nối giữa các REST API của CRM và LLM.

## 3. Mục tiêu & Tiêu chí đánh giá (KPIs)
Để chiến thắng, sản phẩm phải chứng minh đo lường được:
* **Độ chính xác (Accuracy):** >= 85% khi truy xuất thông tin khách hàng/giao dịch (sẽ được test trên 20 ca thử nghiệm chuẩn của Bank A).
* **Hiệu suất:** Giúp RM giảm 50% thời gian soạn email/script.
* **Tính linh hoạt:** Chuyển nguyên mạch ít nhất 3 context CRM khác nhau trong 1 cuộc trò chuyện.
* **Tốc độ:** Phản hồi dưới 5 giây (câu hỏi thường) và dưới 15 giây (tác vụ phức tạp như soạn email).

## 4. Yêu cầu kỹ thuật & Ràng buộc bảo mật (Rất khắt khe)
Bởi vì đây là dữ liệu Ngân hàng, các tiêu chuẩn an toàn là bắt buộc:
* **Bảo mật:** Phải có Audit Log (nhật ký hệ thống) cho **từng LLM call** (để kiểm tra xem AI đang gửi gì ra ngoài). Không lưu log chat không mã hoá. Tuân thủ NĐ 13/2023 về bảo vệ dữ liệu cá nhân.
* **Ngôn ngữ xử lý:** Bắt buộc hiểu tốt Tiếng Việt, đặc biệt là các **từ lóng/viết tắt nghiệp vụ ngân hàng** (KH, ĐNCV, CBNV...) và xử lý được cả tiếng Việt gõ không dấu.
* **Kiến trúc linh hoạt:** Không được phụ thuộc hoàn toàn vào 1 LLM duy nhất (như chỉ xài OpenAI). Cần có cơ chế fallback (chuyển đổi qua lại giữa OpenAI, Claude, Gemini...) để giảm rủi ro chi phí và tính khả dụng.

## 5. Những "Điểm liệt" cần tránh (Anti-patterns)
Ban tổ chức đặc biệt ghi chú những điều họ KHÔNG muốn thấy:
* Dùng mock data tĩnh / hardcode để biểu diễn. (Phải gọi API thật từ CRM Sandbox).
* Agent sinh ra câu trả lời ảo giác (hallucination) không có nguồn gốc (phải trace được về endpoint nào đã cung cấp thông tin).
* Giao diện bắt người dùng phải nhập các câu lệnh đặc biệt (slash command, syntax lạ) thay vì giao tiếp tự nhiên.
* Mất bối cảnh khi người dùng đổi chủ đề đột ngột.

## 6. Chiến lược gợi ý để triển khai (Action Plan)
1. **Thiết kế MCP Server:** Bọc (wrap) các endpoints mà BTC cho (CRM Sandbox API: `/customers`, `/opportunities`, v.v.) thành các MCP Tools.
2. **LLM Routing & Context Management:** Sử dụng framework như LangGraph hoặc LlamaIndex Workflows để xây dựng cơ chế quản lý bộ nhớ (Memory) và luồng suy nghĩ (ReAct Agent) để AI biết lúc nào nên gọi API nào, lúc nào nên dùng Knowledge Base (RAG).
3. **Xử lý ngôn ngữ:** Xây dựng một từ điển nhỏ (Glossary) hoặc RAG cho các thuật ngữ ngân hàng Việt Nam để tiêm (inject) vào system prompt, giúp LLM hiểu đúng ý đồ của RM.
4. **UI/UX:** Xây dựng một giao diện Web Chat đơn giản bằng React/Vue, có các nút thao tác nhanh (Quick actions) như: *[Chèn vào Email]*, *[Lưu Note]*, *[Sửa Script]* để tăng tối đa tính tiện dụng cho RM.
