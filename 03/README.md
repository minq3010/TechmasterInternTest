# 🎵 Dialogue Highlighter

**Dialogue Highlighter** là ứng dụng web phát âm thanh hội thoại và tự động highlight từng từ, từng câu theo đúng thời điểm phát âm, giúp trải nghiệm nghe và đọc hội thoại trở nên trực quan, sinh động.

---

## 🚀 Tính năng nổi bật

- **Phát audio đồng bộ**: Phát file âm thanh `.wav` và highlight chính xác từng từ/câu theo thời gian thực.
- **Tô sáng từng từ**: Mỗi từ được bôi vàng đúng lúc được phát âm.
- **Tự động cuộn (Auto Scroll)**: Cửa sổ hội thoại tự cuộn tới đúng khối hội thoại đang được phát.
- **Thanh kéo thời gian**: Cho phép tua nhanh/chậm đến bất kỳ vị trí nào trong audio, highlight sẽ tương ứng.
- **Phân biệt người nói**: Màu sắc, hiệu ứng khác nhau cho từng nhân vật (James, Flora).
- **Responsive**: Giao diện đẹp, dễ dùng trên cả máy tính và điện thoại.
- **Tương tác trực tiếp**: Click vào bất kỳ từ nào để nhảy đến thời điểm đó trong audio.

---

## 📂 Cấu trúc dự án

```
TechMasterInternTest/03/
├── index.html         # Giao diện chính của ứng dụng
├── styles.css         # Định dạng giao diện, hiệu ứng
├── script.js          # Xử lý logic, đồng bộ audio và text
├── jamesflora.json    # Dữ liệu thời gian cho từng câu/từ
├── jamesflora.wav     # File âm thanh hội thoại
└── README.md          # Hướng dẫn sử dụng (file này)
```

---

## 📝 Định dạng dữ liệu

File `jamesflora.json` chứa thông tin:
- **sentence**: Danh sách các câu, mỗi câu gồm:
  - `r`: Người nói (0 = James, 1 = Flora)
  - `s`: Nội dung câu
  - `t0`, `t1`: Thời gian bắt đầu/kết thúc (giây)
  - `b`, `e`: Vị trí ký tự bắt đầu/kết thúc trong đoạn hội thoại
- **word**: Danh sách các từ, mỗi từ gồm:
  - `[thời gian bắt đầu, thời lượng, từ, vị trí ký tự, độ dài]`

Ví dụ:
```json
{
  "sentence": [
    {
      "r": 0,
      "s": "Hi Flora! How’s your day going?",
      "t0": 0.0,
      "t1": 2.5,
      "b": 0,
      "e": 31
    }
  ],
  "word": [
    [0.0, 0.3, "Hi", 0, 2],
    [0.3, 0.5, "Flora!", 3, 6]
  ]
}
```

---

## 💡 Hướng dẫn sử dụng

1. **Mở file `index.html`** bằng trình duyệt hiện đại (Chrome, Firefox, Edge, Safari).
2. Đảm bảo các file `jamesflora.wav` và `jamesflora.json` nằm cùng thư mục với `index.html`.
3. Nhấn nút ▶️ để phát audio và xem hiệu ứng highlight.
4. Có thể kéo thanh thời gian để tua nhanh/chậm, hoặc click vào từ để nhảy đến thời điểm đó.
5. Bật/tắt tự động cuộn bằng checkbox "Auto Scroll".

---

## Video


