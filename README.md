# Food Chatbot - Gợi Ý Thực Đơn Thông Minh

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Chatbot hỗ trợ người dùng lập thực đơn dựa trên nguyên liệu có sẵn, với khả năng xử lý ngôn ngữ tự nhiên tiếng Việt và tích hợp dịch thuật để truy vấn dữ liệu món ăn tiếng Anh.

## Giới thiệu

Đồ án này xây dựng một giải pháp chatbot thông minh giúp người dùng dễ dàng tìm kiếm món ăn phù hợp với các nguyên liệu họ đang có. Điểm nổi bật của hệ thống là khả năng tương tác hoàn toàn bằng tiếng Việt: người dùng nhập nguyên liệu bằng tiếng Việt, hệ thống sẽ dịch sang tiếng Anh để tìm kiếm trong tập dữ liệu món ăn phong phú, sau đó dịch ngược kết quả món ăn sang tiếng Việt để phản hồi.

Cách tiếp cận này không chỉ vượt qua rào cản ngôn ngữ mà còn mang lại trải nghiệm thân thiện và tiện lợi. Hệ thống tích hợp các công nghệ xử lý ngôn ngữ tự nhiên (NLP), dịch máy, và một giao diện người dùng hiện đại được xây dựng bằng ReactJS, backend được xử lý bởi Flask (Python).

## Tính năng nổi bật

*   **Tương tác bằng tiếng Việt:** Người dùng nhập liệu và nhận kết quả hoàn toàn bằng tiếng Việt.
*   **Xử lý ngôn ngữ tự nhiên & Dịch thuật:** Tích hợp dịch thuật Việt-Anh và Anh-Việt để truy vấn dữ liệu món ăn.
*   **Gợi ý món ăn chính xác:** Tìm kiếm món ăn dựa trên nguyên liệu người dùng cung cấp.
*   **Quản lý người dùng:** Hỗ trợ đăng ký, đăng nhập để cá nhân hóa trải nghiệm.
*   **Lịch sử trò chuyện:** Lưu lại các cuộc hội thoại để người dùng dễ dàng xem lại.
*   **Giao diện thân thiện:** UI/UX được thiết kế trực quan, dễ sử dụng, responsive trên nhiều thiết bị.
*   **(Mở rộng - Đang phát triển/Đã có)** Gợi ý món ăn dựa trên thuật toán Lọc cộng tác tìm người dùng tương đồng (User-based Collaborative Filtering).

## Kiến trúc hệ thống

Hệ thống được xây dựng theo mô hình client-server:

*   **Client (Frontend):**
    *   Công nghệ: ReactJS
    *   Chức năng: Xây dựng giao diện người dùng, xử lý tương tác, gửi yêu cầu đến server qua API.
    *   Các thành phần chính: Trang đăng nhập/đăng ký, khung chat, hiển thị lịch sử trò chuyện.
    *   Thiết kế: Tông màu xanh lá và cam, responsive, các hiệu ứng UI/UX hiện đại.
*   **Server (Backend):**
    *   Công nghệ: Flask (Python)
    *   Chức năng: Tiếp nhận yêu cầu từ client, xử lý logic nghiệp vụ (đăng ký, đăng nhập, tìm kiếm món ăn), tương tác với dữ liệu.
    *   API Endpoints:
        *   `POST /register`: Đăng ký tài khoản người dùng (lưu vào `users.json`).
        *   `POST /login`: Đăng nhập tài khoản người dùng.
        *   `POST /chat`: Xử lý yêu cầu tìm kiếm món ăn, dịch thuật và trả về kết quả.
    *   Dữ liệu:
        *   Tài khoản người dùng: Lưu trong `users.json`.
        *   Lịch sử chat: Lưu trong `chat_logs.json`.
        *   Dữ liệu món ăn: Trích xuất từ `train.json` (Recipe Ingredients Dataset - hơn 20.000 món), được nạp vào bộ nhớ khi server khởi động để tăng tốc độ phản hồi.

## Xử lý dữ liệu và Thuật toán

### Tìm kiếm món ăn theo nguyên liệu:
1.  **Dịch thuật:** Nguyên liệu nhập bằng tiếng Việt được dịch sang tiếng Anh.
2.  **So khớp nguyên liệu:**
    *   So khớp cụm nguyên liệu hoàn chỉnh.
    *   So khớp từ độc lập bằng regex.
    *   Fuzzy Matching (sử dụng `difflib`) để xử lý lỗi chính tả.
3.  **Kết quả:** Món ăn tìm được (tiếng Anh) được dịch ngược sang tiếng Việt trước khi hiển thị.

### (Mở rộng) Gợi ý món ăn theo Lọc cộng tác:
1.  **Tạo ma trận User-Item:** Biểu diễn lịch sử tìm kiếm/tương tác của người dùng với các món ăn.
2.  **Tính độ tương đồng User-User:** Sử dụng `cosine_similarity`.
3.  **Tìm User tương đồng nhất.**
4.  **Gợi ý:** Đề xuất các món ăn mà user tương đồng đã thích/tìm kiếm mà người dùng hiện tại chưa tương tác.

## Cài đặt và Chạy dự án

### Điều kiện tiên quyết
*   Node.js và npm (hoặc yarn) cho Frontend.
*   Python 3.x và pip cho Backend.

### Backend (Flask)
1.  Di chuyển vào thư mục `backend`:
    ```bash
    cd backend
    ```
2.  (Tùy chọn nhưng khuyến nghị) Tạo và kích hoạt môi trường ảo:
    ```bash
    python -m venv venv
    # Windows
    .\venv\Scripts\activate
    # macOS/Linux
    source venv/bin/activate
    ```
3.  Cài đặt các thư viện cần thiết:
    ```bash
    pip install Flask Flask-CORS <tên_thư_viện_dịch_thuật_bạn_dùng> difflib # (difflib là thư viện chuẩn, không cần cài)
    # Ví dụ nếu dùng googletrans: pip install googletrans==4.0.0-rc1
    ```
4.  Chạy server Flask:
    ```bash
    python app.py
    ```
    Server sẽ chạy mặc định tại `http://127.0.0.1:5000`.

### Frontend (ReactJS)
1.  Di chuyển vào thư mục `frontend`:
    ```bash
    cd frontend
    ```
2.  Cài đặt các dependencies:
    ```bash
    npm install
    # hoặc
    # yarn install
    ```
3.  Chạy ứng dụng React:
    ```bash
    npm start
    # hoặc
    # yarn start
    ```
    Ứng dụng sẽ mở trong trình duyệt tại `http://localhost:3000`.

## Hướng phát triển tương lai

*   Tích hợp thông tin dinh dưỡng chi tiết cho từng món ăn.
*   Hiển thị hình ảnh món ăn.
*   Cho phép người dùng đánh dấu "yêu thích", "đã thử".
*   Cải thiện thuật toán gợi ý bằng cách học từ hành vi người dùng.
*   Sử dụng cơ sở dữ liệu thực thụ (ví dụ: MongoDB) thay vì file JSON khi quy mô lớn hơn.
*   Nâng cao khả năng xử lý ngôn ngữ tự nhiên, hiểu các câu phức tạp hơn.

## Đóng góp

Nếu bạn có ý tưởng hoặc muốn đóng góp, vui lòng tạo một "Issue" hoặc "Pull Request".

## Tác giả

*   [Tên Của Bạn/Nhóm Của Bạn] - [Email hoặc Link GitHub cá nhân nếu muốn]

## License

Dự án này được cấp phép theo Giấy phép MIT - xem file [LICENSE.md](LICENSE.md) (bạn cần tạo file này) để biết chi tiết.
