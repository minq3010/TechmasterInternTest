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
## 4. Thêm các từ vựng
```sql
DELIMITER //

CREATE PROCEDURE AddFullWord(
    IN p_word_text VARCHAR(255),
    IN p_pronunciation VARCHAR(255),
    IN p_word_type_id INT,
    IN p_meaning_text TEXT,
    IN p_translation_en TEXT,
    IN p_translation_ja TEXT
)
BEGIN
    INSERT INTO Words (word_text, pronunciation) VALUES (p_word_text, p_pronunciation);
    SET @new_word_id = LAST_INSERT_ID();

    INSERT INTO WordMeanings (word_id, word_type_id, meaning_text)
    VALUES (@new_word_id, p_word_type_id, p_meaning_text);
    SET @new_meaning_id = LAST_INSERT_ID();

    INSERT INTO Translations (meaning_id, language, translated_text)
    VALUES (@new_meaning_id, 'en', p_translation_en),
           (@new_meaning_id, 'ja', p_translation_ja);
END //

DELIMITER ;

CALL AddFullWord('đông', 'do^ng', 1, 'mùa đông, thời kỳ lạnh nhất trong năm', 'winter', '冬');
CALL AddFullWord('học', 'hoc', 2, 'tiếp thu kiến thức, rèn luyện kỹ năng', 'to study', '学ぶ');
CALL AddFullWord('mẹ', 'me', 1, 'người phụ nữ sinh ra và nuôi dưỡng con', 'mother', '母');
CALL AddFullWord('đẹp', 'dep', 3, 'có vẻ ngoài dễ nhìn, hấp dẫn', 'beautiful', '美しい');
CALL AddFullWord('ăn', 'an', 2, 'đưa thức ăn vào cơ thể', 'to eat', '食べる');
CALL AddFullWord('trường', 'truong', 1, 'nơi học tập, giáo dục', 'school', '学校');
CALL AddFullWord('cao', 'cao', 3, 'có chiều cao lớn', 'tall/high', '高い');
CALL AddFullWord('bạn', 'ban', 1, 'người cùng chơi, cùng học', 'friend', '友達');
CALL AddFullWord('nhanh', 'nhanh', 3, 'di chuyển hoặc thực hiện việc gì trong thời gian ngắn', 'fast', '速い');
CALL AddFullWord('trái', 'trai', 1, 'quả cây', 'fruit', '果物');
CALL AddFullWord('nước', 'nuoc', 1, 'chất lỏng không màu, không mùi, không vị', 'water', '水');
CALL AddFullWord('cười', 'cuoi', 2, 'thể hiện sự vui vẻ bằng nét mặt', 'to laugh', '笑う');
CALL AddFullWord('ngủ', 'ngu', 2, 'trạng thái nghỉ ngơi tự nhiên của cơ thể', 'to sleep', '寝る');
CALL AddFullWord('đọc', 'doc', 2, 'xem và hiểu nội dung văn bản', 'to read', '読む');
CALL AddFullWord('viết', 'viet', 2, 'dùng chữ để ghi lại thông tin', 'to write', '書く');
CALL AddFullWord('mưa', 'mua', 1, 'hiện tượng nước rơi từ trên trời xuống', 'rain', '雨');
CALL AddFullWord('bán', 'ban', 2, 'chuyển giao hàng hóa lấy tiền', 'to sell', '売る');
CALL AddFullWord('mua', 'mua', 2, 'nhận hàng hóa bằng cách trả tiền', 'to buy', '買う');
CALL AddFullWord('đi', 'di', 2, 'di chuyển từ nơi này đến nơi khác', 'to go', '行く');
CALL AddFullWord('nhỏ', 'nho', 3, 'có kích thước bé', 'small', '小さい');
CALL AddFullWord('to', 'to', 3, 'có kích thước lớn', 'big', '大きい');
CALL AddFullWord('trắng', 'trang', 3, 'màu của tuyết hoặc sữa', 'white', '白い');
CALL AddFullWord('đen', 'den', 3, 'màu của than hoặc bóng tối', 'black', '黒い');
CALL AddFullWord('xanh', 'xanh', 3, 'màu của trời hoặc lá cây', 'blue/green', '青い');
CALL AddFullWord('đỏ', 'do', 3, 'màu của máu hoặc hoa hồng', 'red', '赤い');
CALL AddFullWord('vàng', 'vang', 3, 'màu của mặt trời hoặc hoa hướng dương', 'yellow', '黄色い');
CALL AddFullWord('thầy', 'thay', 1, 'người dạy học', 'teacher', '先生');
CALL AddFullWord('trò', 'tro', 1, 'người học', 'student', '生徒');
CALL AddFullWord('bố', 'bo', 1, 'người đàn ông sinh ra và nuôi dưỡng con', 'father', '父');
CALL AddFullWord('em', 'em', 1, 'người nhỏ tuổi hơn trong gia đình', 'younger sibling', '弟/妹');
CALL AddFullWord('chị', 'chi', 1, 'người con gái lớn hơn trong gia đình', 'older sister', '姉');
CALL AddFullWord('anh', 'anh', 1, 'người con trai lớn hơn trong gia đình', 'older brother', '兄');
CALL AddFullWord('bà', 'ba', 1, 'mẹ của bố hoặc mẹ', 'grandmother', '祖母');
CALL AddFullWord('ông', 'ong', 1, 'bố của bố hoặc mẹ', 'grandfather', '祖父');
CALL AddFullWord('yêu', 'yeu', 2, 'cảm xúc thương mến', 'to love', '愛する');
CALL AddFullWord('ghét', 'ghet', 2, 'không thích, không ưa', 'to hate', '嫌う');
CALL AddFullWord('vui', 'vui', 3, 'cảm xúc tích cực', 'happy', '嬉しい');
CALL AddFullWord('buồn', 'buon', 3, 'cảm xúc tiêu cực', 'sad', '悲しい');
CALL AddFullWord('đau', 'dau', 3, 'cảm giác khó chịu về thể chất', 'painful', '痛い');
CALL AddFullWord('ấm', 'am', 3, 'nhiệt độ dễ chịu', 'warm', '暖かい');
CALL AddFullWord('lạnh', 'lanh', 3, 'nhiệt độ thấp', 'cold', '寒い');
CALL AddFullWord('ngon', 'ngon', 3, 'hương vị hấp dẫn', 'delicious', '美味しい');
CALL AddFullWord('dở', 'do', 3, 'hương vị không hấp dẫn', 'bad (taste)', 'まずい');
CALL AddFullWord('sớm', 'som', 4, 'khi trời chưa sáng hoặc trước dự định', 'early', '早い');
CALL AddFullWord('muộn', 'muon', 4, 'sau thời gian dự định', 'late', '遅い');
CALL AddFullWord('xa', 'xa', 3, 'khoảng cách lớn', 'far', '遠い');
CALL AddFullWord('gần', 'gan', 3, 'khoảng cách nhỏ', 'near', '近い');
CALL AddFullWord('trước', 'truoc', 5, 'ở phía trước', 'before/in front', '前');
CALL AddFullWord('sau', 'sau', 5, 'ở phía sau', 'after/behind', '後');
CALL AddFullWord('bên', 'ben', 5, 'ở cạnh', 'beside', 'そば');
CALL AddFullWord('giữa', 'giua', 5, 'ở trung tâm', 'between', '間');
CALL AddFullWord('trên', 'tren', 5, 'ở phía trên', 'above', '上');
CALL AddFullWord('dưới', 'duoi', 5, 'ở phía dưới', 'below', '下');
CALL AddFullWord('và', 'va', 7, 'liên kết hai yếu tố', 'and', 'そして');
CALL AddFullWord('hoặc', 'hoac', 7, 'chọn lựa giữa các yếu tố', 'or', 'または');
CALL AddFullWord('nhưng', 'nhung', 7, 'đối lập ý', 'but', 'しかし');
CALL AddFullWord('nếu', 'neu', 7, 'giả định', 'if', 'もし');
CALL AddFullWord('vì', 'vi', 7, 'nguyên nhân', 'because', 'なぜなら');
CALL AddFullWord('khi', 'khi', 7, 'thời gian sự việc xảy ra', 'when', '時');
CALL AddFullWord('hay', 'hay', 7, 'hoặc, cũng có thể', 'or/also', 'または');
CALL AddFullWord('ôi', 'oi', 8, 'thán từ', 'oh!', 'おい');
CALL AddFullWord('chao', 'chao', 8, 'thán từ', 'wow!', 'わあ');
CALL AddFullWord('ồ', 'o', 8, 'thán từ', 'oh!', 'ああ');
CALL AddFullWord('á', 'a', 8, 'thán từ', 'ah!', 'あっ');
CALL AddFullWord('ơi', 'oi', 8, 'gọi ai đó', 'hey!', 'ねえ');
CALL AddFullWord('đây', 'day', 5, 'chỉ vị trí gần người nói', 'here', 'ここ');
CALL AddFullWord('kia', 'kia', 5, 'chỉ vị trí xa người nói', 'there', 'そこ');
CALL AddFullWord('nào', 'nao', 5, 'chỉ lựa chọn', 'which', 'どれ');
CALL AddFullWord('ai', 'ai', 5, 'chỉ người', 'who', '誰');
CALL AddFullWord('gì', 'gi', 5, 'chỉ vật', 'what', '何');
CALL AddFullWord('đó', 'do', 5, 'chỉ người/vật xa', 'that', 'あれ');
CALL AddFullWord('đây', 'day', 5, 'chỉ người/vật gần', 'this', 'これ');
CALL AddFullWord('cái', 'cai', 1, 'vật thể chung', 'thing', 'もの');
CALL AddFullWord('việc', 'viec', 1, 'sự việc', 'work/task', '仕事');
CALL AddFullWord('chuyện', 'chuyen', 1, 'câu chuyện, sự kiện', 'story', '話');
CALL AddFullWord('năm', 'nam', 8, 'thán từ, số', 'year', '年');
CALL AddFullWord('tháng', 'thang', 1, 'đơn vị thời gian', 'month', '月');
CALL AddFullWord('tuần', 'tuan', 1, 'đơn vị thời gian', 'week', '週');
CALL AddFullWord('ngày', 'ngay', 1, 'đơn vị thời gian', 'day', '日');
CALL AddFullWord('giờ', 'gio', 1, 'đơn vị thời gian', 'hour', '時');
CALL AddFullWord('phút', 'phut', 1, 'đơn vị thời gian', 'minute', '分');
CALL AddFullWord('giây', 'giay', 1, 'đơn vị thời gian', 'second', '秒');
CALL AddFullWord('sách', 'sach', 1, 'vật đọc', 'book', '本');
CALL AddFullWord('bút', 'but', 1, 'dụng cụ viết', 'pen', 'ペン');
CALL AddFullWord('bàn', 'ban', 1, 'vật để làm việc, để đồ', 'table', 'テーブル');
CALL AddFullWord('ghế', 'ghe', 1, 'vật để ngồi', 'chair', '椅子');
CALL AddFullWord('máy', 'may', 1, 'thiết bị cơ học', 'machine', '機械');
CALL AddFullWord('xe', 'xe', 1, 'phương tiện di chuyển', 'vehicle/car', '車');
CALL AddFullWord('nhà', 'nha', 1, 'nơi ở', 'house', '家');
CALL AddFullWord('đường', 'duong', 1, 'lối đi', 'road', '道');
CALL AddFullWord('cửa', 'cua', 1, 'lối ra vào', 'door', 'ドア');
CALL AddFullWord('mắt', 'mat', 1, 'bộ phận nhìn', 'eye', '目');
CALL AddFullWord('tai', 'tai', 1, 'bộ phận nghe', 'ear', '耳');
CALL AddFullWord('mũi', 'mui', 1, 'bộ phận ngửi', 'nose', '鼻');
CALL AddFullWord('miệng', 'mieng', 1, 'bộ phận ăn nói', 'mouth', '口');
CALL AddFullWord('tay', 'tay', 1, 'bộ phận cầm nắm', 'hand', '手');
CALL AddFullWord('chân', 'chan', 1, 'bộ phận đi lại', 'leg', '足');
CALL AddFullWord('tim', 'tim', 1, 'bộ phận bơm máu', 'heart', '心臓');
CALL AddFullWord('đầu', 'dau', 1, 'phần trên cơ thể', 'head', '頭');

```

## 5. Ví dụ truy vấn tìm từ

```sql
DELIMITER //

CREATE PROCEDURE GetWordDetails(
    IN p_word_text VARCHAR(255)
)
BEGIN 
    SELECT 
        w.word_text,
        w.pronunciation,
        wt.type_name,
        wm.meaning_text,
        t.language,
        t.translated_text,
        t.pronunciation as translattion_pronunciation,
        e.example_text,
        e.translation_en,
        e.translation_ja
    FROM Words w 
    JOIN WordMeanings wm ON w.word_id = wm.word_id
    JOIN WordTypes wt ON wm.word_type_id = wt.word_type_id
    LEFT JOIN Translations t ON wm.meaning_id = t.meaning_id
    LEFT JOIN Examples e ON wm.meaning_id = e.meaning_id
    WHERE w.word_text = p_word_text;
END //

DELIMITER;

CALL GetWordsDetails('chạy');
```
- **Kết quả**f
![](https://github.com/user-attachments/assets/ab6c4bca-a2da-4531-a62c-e30533397fef)

