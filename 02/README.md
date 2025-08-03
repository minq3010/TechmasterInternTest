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

Bảng	Vai trò
- words	                    : Lưu thông tin cơ bản về từ tiếng Việt (từ, phát âm)
- word_types	            : Danh sách loại từ gốc bằng tiếng Việt (danh từ, động từ,...)
- word_type_translations	: Dịch tên loại từ sang các ngôn ngữ khác
- meanings	                : Các ý nghĩa cụ thể của từ theo loại từ
- translations	            : Bản dịch ý nghĩa sang các ngôn ngữ khác
- examples	                : Câu ví dụ minh họa cho từng ý nghĩa, kèm bản dịch

#### Sơ đồ mối quan hệ (ERD text):

- Mỗi từ (words) có thể có nhiều nghĩa (meanings)
- Mỗi nghĩa (meanings) gắn với một loại từ (word_types)
- Mỗi nghĩa có thể có nhiều bản dịch (translations) theo từng ngôn ngữ
- word_types có bản dịch cố định sang tiếng Anh và Nhật (type_en, type_ja)

![](https://github.com/user-attachments/assets/81092659-affa-4106-9de3-a1ada1e8b839)
  
## 3. Lệnh SQL tạo bảng

```sql
CREATE TABLE WordTypes (
    word_type_id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL
);


CREATE TABLE Words (
    word_id INT AUTO_INCREMENT PRIMARY KEY,
    word_text VARCHAR(255) NOT NULL,
    pronunciation VARCHAR(255)
);


CREATE TABLE WordMeanings (
    meaning_id INT AUTO_INCREMENT PRIMARY KEY,
    word_id INT,
    word_type_id INT,
    meaning_text TEXT NOT NULL,
    FOREIGN KEY (word_id) REFERENCES Words(word_id),
    FOREIGN KEY (word_type_id) REFERENCES WordTypes(word_type_id)
);


CREATE TABLE Translations (
    translation_id INT AUTO_INCREMENT PRIMARY KEY,
    meaning_id INT,
    language VARCHAR(10) NOT NULL,
    translated_text TEXT NOT NULL,
    pronunciation VARCHAR(255),
    FOREIGN KEY (meaning_id) REFERENCES WordMeanings(meaning_id)
);


CREATE TABLE Examples (
    example_id INT AUTO_INCREMENT PRIMARY KEY,
    meaning_id INT,
    example_text TEXT NOT NULL,
    translation_en TEXT,
    translation_ja TEXT,
    FOREIGN KEY (meaning_id) REFERENCES WordMeanings(meaning_id)
);


CREATE TABLE Synonyms (
    synonym_id INT AUTO_INCREMENT PRIMARY KEY,
    word_id INT,
    synonym_word_id INT,
    FOREIGN KEY (word_id) REFERENCES Words(word_id),
    FOREIGN KEY (synonym_word_id) REFERENCES Words(word_id)
);
```

## 4. Ví dụ truy vấn tìm từ

```sql
SELECT 
    w.word_text,
    w.pronunciation AS vn_pronunciation,
    wt.type_name,
    wm.meaning_text,
    t.language,
    t.translated_text,
    t.pronunciation AS translated_pronunciation,
    e.example_text,
    e.translation_en,
    e.translation_ja,
    GROUP_CONCAT(ws.word_text) AS synonyms
FROM 
    Words w
    LEFT JOIN WordMeanings wm ON w.word_id = wm.word_id
    LEFT JOIN WordTypes wt ON wm.word_type_id = wt.word_type_id
    LEFT JOIN Translations t ON wm.meaning_id = t.meaning_id
    LEFT JOIN Examples e ON wm.meaning_id = e.meaning_id
    LEFT JOIN Synonyms s ON w.word_id = s.word_id
    LEFT JOIN Words ws ON s.synonym_word_id = ws.word_id
WHERE 
    w.word_text = 'chạy'
GROUP BY 
    w.word_id, wm.meaning_id, t.translation_id, e.example_id;
```
- **Kết quả**f
![](https://github.com/user-attachments/assets/ab6c4bca-a2da-4531-a62c-e30533397fef)

