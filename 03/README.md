# Báo cáo: Highlight Hội Thoại

---

## Tính năng

- **Phát audio đồng bộ**: Phát file âm thanh `.wav` và highlight chính xác từng từ/câu theo thời gian thực.
- **Tô sáng từng từ**: Mỗi từ được bôi vàng đúng lúc được phát âm.
- **Tự động cuộn (Auto Scroll)**: Cửa sổ hội thoại tự cuộn tới đúng khối hội thoại đang được phát.
- **Thanh kéo thời gian**: Cho phép tua nhanh/chậm đến bất kỳ vị trí nào trong audio, highlight sẽ tương ứng.
- **Phân biệt người nói**: Màu sắc, hiệu ứng khác nhau cho từng nhân vật (James, Flora).
- **Responsive**: Giao diện đẹp, dễ dùng trên cả máy tính và điện thoại.
- **Tương tác trực tiếp**: Click vào bất kỳ từ nào để nhảy đến thời điểm đó trong audio.

---

## Định dạng dữ liệu

File `jamesflora.json` chứa thông tin:
- **sentence**: Danh sách các câu, mỗi câu gồm:
  - `r`: Người nói (0 = James, 1 = Flora)
  - `s`: Nội dung câu
  - `t0`, `t1`: Thời gian bắt đầu/kết thúc (giây)
  - `b`, `e`: Vị trí ký tự bắt đầu/kết thúc trong đoạn hội thoại
- **word**: Danh sách các từ, mỗi từ gồm:
  - `[thời gian bắt đầu, thời lượng, từ, vị trí ký tự, độ dài]`

---

## Hướng dẫn sử dụng

1. **Mở file `index.html`** bằng trình duyệt (Chrome, Firefox, Edge, Safari).
2. Đảm bảo các file `jamesflora.wav` và `jamesflora.json` nằm cùng thư mục với `index.html`.
3. Nhấn nút ▶️ để phát audio và xem hiệu ứng highlight.
4. Có thể kéo thanh thời gian để tua nhanh/chậm, hoặc click vào từ để nhảy đến thời điểm đó.
5. Bật/tắt tự động cuộn bằng checkbox "Auto Scroll".

---

## Video demo
![](https://github.com/user-attachments/assets/122af87d-34df-4c13-8556-c15276a68c6e)
