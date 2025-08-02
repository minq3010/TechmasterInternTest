#Báo cáo: Ứng Dụng Chơi Cờ Caro Online 15x15 Sử Dụng Go WebSocket

## 1. Mục tiêu

- Xây dựng ứng dụng cờ caro (Gomoku) 15x15 cho 2 người chơi (A và B) trên trình duyệt.
- Đồng bộ nước đi giữa 2 người chơi qua WebSocket (không dùng framework Iris).
- Server kiểm tra thắng/thua, gửi trạng thái game về cho cả 2 phía.
- Giao diện đẹp, realtime, có thông báo thắng/thua, hỗ trợ chơi lại.

---

## 2. Kiến trúc tổng thể

### Frontend

- **HTML, CSS, JavaScript (`app.js`)**
    - Vẽ bàn cờ, xử lý click, gửi/nhận nước đi qua WebSocket.
    - Hiển thị trạng thái, phân vai X/O, thông báo thắng/thua.

### Backend

- **Go + gorilla/websocket**
    - Quản lý phòng chơi, trạng thái bàn cờ, kiểm tra thắng/thua.
    - Nhận nước đi từ client, kiểm tra hợp lệ, broadcast cho tất cả client.
    - Hỗ trợ chơi lại (reset).

---

## 3. Chi tiết các thành phần

### 3.1. Frontend

- **`index.html`:**  
    - Bố cục giao diện, tạo bảng 15x15, hiển thị thông tin người chơi, nút điều khiển.

- **`style.css`:**  
    - Tối ưu trải nghiệm, responsive, hiệu ứng cho các trạng thái (thắng, lượt, ...).

- **Minh hoạ giao diện:**

    ![Giao diện bàn cờ caro](https://github.com/user-attachments/assets/221ca039-fc1c-4320-944a-b0f9fd680f39)

- **`app.js`:**  
    - Kết nối WebSocket tới server.
    - Lắng nghe sự kiện từ server (`gameState`, `move`, `reset`...).
    - Gửi nước đi, reset game.
    - Cập nhật giao diện theo trạng thái game.

- **Ví dụ thông báo trạng thái:**

    ![Thông báo trạng thái](https://github.com/user-attachments/assets/90e3cbaa-3c55-41ad-8bf1-8738743804af)

---

### 3.2. Backend (Go)

- **`main.go`:**  
    - Định nghĩa các struct: `GameState`, `Move`, `Client`, `GameRoom`, ...
    - Quản lý phòng chơi, danh sách client, trạng thái bàn cờ.
    - Xử lý đăng ký, hủy đăng ký client.
    - Nhận nước đi, kiểm tra hợp lệ, kiểm tra thắng/thua (5 quân liên tiếp ngang/dọc/chéo).
    - Broadcast trạng thái mới cho tất cả client.
    - Xử lý chơi lại (reset).

- **`go.mod`:**  
    - Quản lý dependency (sử dụng `github.com/gorilla/websocket`).

---

## 4. Quy trình hoạt động

1. Người chơi mở trình duyệt → Giao diện kết nối WebSocket tới server.
2. Server phân vai (X hoặc O) cho từng client.
3. Người chơi click vào ô trống → Gửi nước đi lên server.
4. Server kiểm tra hợp lệ, cập nhật trạng thái → Gửi lại cho cả 2 client.
5. Nếu có người thắng hoặc hòa → Server gửi thông báo kết thúc, highlight các ô thắng.
6. Chơi lại: Người chơi nhấn nút "Chơi lại" → Server reset trạng thái, gửi lại cho client.

---

## 5. Một số đoạn code tiêu biểu

- Khởi tạo bàn cờ 15x15 (Go)
- Kiểm tra thắng/thua (Go)
- Gửi/nhận nước đi qua WebSocket (JS)

---

## 6. Hướng dẫn chạy thử

1. Cài đặt Go và Node.js (nếu cần).
2. Cài dependencies Go:  
   ```bash
   go mod tidy
   ```
3. Chạy server Go:  
   ```bash
   go run main.go
   ```
4. Mở 2 tab trình duyệt truy cập [http://localhost:8080](http://localhost:8080) để chơi 2 người.

---

## 7. Kết quả đạt được

- Ứng dụng cờ caro 15x15 realtime, giao diện đẹp, phân vai X/O tự động.
- Đồng bộ nước đi giữa 2 người chơi qua WebSocket.
- Kiểm tra thắng/thua trên server, thông báo kết quả rõ ràng.
- Hỗ trợ chơi lại, hướng dẫn sử dụng.

![Demo kết quả](https://github.com/user-attachments/assets/2f620fda-bc05-447d-aae0-2a518ba3fc00)

---

## 8. Kết luận

- Bài tập đã hoàn thành đầy đủ các yêu cầu: giao diện, đồng bộ realtime, kiểm tra thắng/thua, phân vai, chơi lại.
- Ứng dụng đáp ứng trải nghiệm thực tế tốt, có thể mở rộng cho nhiều phòng chơi, hoặc thêm tính năng chơi với máy.

---
