# Báo cáo: Thiết kế Cơ Sở Dữ Liệu Ứng Dụng Từ Điển Việt-Anh-Nhật

## 1. Mô tả bài toán

Ứng dụng từ điển hỗ trợ tra cứu từ tiếng Việt, hiển thị loại từ, ý nghĩa, dịch nghĩa sang tiếng Anh và tiếng Nhật. Hệ thống yêu cầu quản lý các thông tin về từ, phát âm, loại từ, ý nghĩa và bản dịch.

## 2. Phân tích & Thiết kế

### 2.1. Yêu cầu chính

- Tìm kiếm từ tiếng Việt.
- Hiển thị phát âm.
- Hiển thị loại từ (danh từ, động từ, tính từ, …).
- Hiển thị ý nghĩa/giải thích của từng loại từ.
- Dịch phần loại từ và ý nghĩa sang tiếng Anh và tiếng Nhật.

### 2.2. Mô hình dữ liệu đề xuất

#### Các bảng chính:

- **words**: Lưu thông tin từ tiếng Việt.
- **word_types**: Các loại từ (danh từ, động từ, tính từ…).
- **word_type_translations**: Dịch các loại từ (noun, 名詞, v.v.)
- **meanings**: Ý nghĩa/giải thích của từ cho từng loại từ.
- **translations**: Bản dịch sang các ngôn ngữ khác (Anh, Nhật) cho từng ý nghĩa.

#### Sơ đồ mối quan hệ (ERD text):

- words (id, word, pronunciation)
- word_types (id, type_vi, type_en, type_ja)
- meanings (id, word_id, word_type_id, meaning_vi)
- translations (id, meaning_id, lang, meaning_translated)

## 3. Lệnh SQL tạo bảng

```sql
-- Bảng từ tiếng Việt
CREATE TABLE words (
    id INT PRIMARY KEY AUTO_INCREMENT,
    word VARCHAR(100) NOT NULL,
    pronunciation VARCHAR(100)
);

-- Bảng loại từ tiếng Việt (danh từ, động từ, ...)
CREATE TABLE word_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type_vi VARCHAR(50) NOT NULL
);

-- Bảng bản dịch loại từ (noun, 名詞, v.v.)
CREATE TABLE word_type_translations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    word_type_id INT NOT NULL,
    lang VARCHAR(10) NOT NULL, -- 'en' hoặc 'ja'
    type_translated VARCHAR(50) NOT NULL,
    FOREIGN KEY (word_type_id) REFERENCES word_types(id)
);

-- Bảng nghĩa tiếng Việt của từ
CREATE TABLE meanings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    word_id INT NOT NULL,
    word_type_id INT NOT NULL,
    meaning_vi VARCHAR(255) NOT NULL,
    FOREIGN KEY (word_id) REFERENCES words(id),
    FOREIGN KEY (word_type_id) REFERENCES word_types(id)
);

-- Bảng bản dịch nghĩa sang tiếng Anh và Nhật
CREATE TABLE translations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    meaning_id INT NOT NULL,
    lang VARCHAR(10) NOT NULL, -- 'en' hoặc 'ja'
    meaning_translated VARCHAR(255) NOT NULL,
    FOREIGN KEY (meaning_id) REFERENCES meanings(id)
);
```

## 4. Ví dụ nhập dữ liệu

```sql
-- Từ gốc
INSERT INTO words (word, pronunciation) VALUES ('đông', 'đông');

-- Loại từ
INSERT INTO word_types (type_vi) VALUES ('danh từ'), ('tính từ'), ('động từ');

-- Dịch loại từ
INSERT INTO word_type_translations (word_type_id, lang, type_translated) VALUES
(1, 'en', 'noun'), (1, 'ja', '名詞'),
(2, 'en', 'adjective'), (2, 'ja', '形容詞'),
(3, 'en', 'verb'), (3, 'ja', '動詞');

-- Ý nghĩa
INSERT INTO meanings (word_id, word_type_id, meaning_vi) VALUES
(1, 1, 'mùa đông'), (1, 1, 'phía đông'),
(1, 2, 'đông vui'), (1, 2, 'đông đúc'),
(1, 3, 'đông lại'), (1, 3, 'đông cứng');

-- Dịch nghĩa
INSERT INTO translations (meaning_id, lang, meaning_translated) VALUES
(1, 'en', 'winter'), (1, 'ja', '冬 (ふゆ, fuyu)'),
(2, 'en', 'eastern'), (2, 'ja', '東 (ひがし, higashi)'),
(3, 'en', 'crowded'), (3, 'ja', 'にぎやか'),
(4, 'en', 'busy'), (4, 'ja', '混雑している'),
(5, 'en', 'freeze'), (5, 'ja', '凍る'),
(6, 'en', 'frozen'), (6, 'ja', '凍結した');


## 5. Nhận xét & mở rộng

- Thiết kế dễ mở rộng cho nhiều ngôn ngữ dịch khác.
- Có thể bổ sung bảng ví dụ sử dụng từ, bảng người dùng, lịch sử tra cứu…
- Đảm bảo tính chuẩn hóa, tránh dư thừa dữ liệu.

---
