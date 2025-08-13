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
    word_type_id INT PRIMARY KEY AUTO_INCREMENT,
    type_name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE Words (
    word_id INT PRIMARY KEY AUTO_INCREMENT,
    word_text VARCHAR(255) NOT NULL UNIQUE,
    pronunciation VARCHAR(255)
);

CREATE TABLE WordMeanings (
    meaning_id INT PRIMARY KEY AUTO_INCREMENT,
    word_id INT NOT NULL,
    word_type_id INT NOT NULL,
    meaning_label VARCHAR(255),
    meaning_text TEXT NOT NULL,
    FOREIGN KEY (word_id) REFERENCES Words(word_id) ON DELETE CASCADE,
    FOREIGN KEY (word_type_id) REFERENCES WordTypes(word_type_id)
);

CREATE TABLE Translations (
    translation_id INT PRIMARY KEY AUTO_INCREMENT,
    meaning_id INT NOT NULL,
    language VARCHAR(10) NOT NULL,
    translated_text TEXT NOT NULL,
    pronunciation VARCHAR(255),
    FOREIGN KEY (meaning_id) REFERENCES WordMeanings(meaning_id) ON DELETE CASCADE
);

CREATE TABLE Examples (
    example_id INT PRIMARY KEY AUTO_INCREMENT,
    meaning_id INT NOT NULL,
    example_text TEXT NOT NULL,
    translation_en TEXT,
    translation_ja TEXT,
    FOREIGN KEY (meaning_id) REFERENCES WordMeanings(meaning_id) ON DELETE CASCADE
);

CREATE TABLE Synonyms (
    synonym_id INT PRIMARY KEY AUTO_INCREMENT,
    word_id INT NOT NULL,
    synonym_word_id INT NOT NULL,
    FOREIGN KEY (word_id) REFERENCES Words(word_id) ON DELETE CASCADE,
    FOREIGN KEY (synonym_word_id) REFERENCES Words(word_id) ON DELETE CASCADE
);

```
## 4. Thêm các từ vựng
```sql
DELIMITER //

CREATE PROCEDURE AddFullWord(
    IN p_word_id INT,
    IN p_word_text VARCHAR(255),
    IN p_pronunciation VARCHAR(255),

    IN p_meaning_id INT,
    IN p_word_type_id INT,
    IN p_meaning_label VARCHAR(255),
    IN p_meaning_text TEXT,

    IN p_translation_en_id INT,
    IN p_translation_en TEXT,
    IN p_pronunciation_en VARCHAR(255),

    IN p_translation_ja_id INT,
    IN p_translation_ja TEXT,
    IN p_pronunciation_ja VARCHAR(255),

    IN p_example_id INT,
    IN p_example_text TEXT,
    IN p_example_en TEXT,
    IN p_example_ja TEXT
)
BEGIN
    -- Thêm từ vào bảng Words nếu chưa có
    INSERT IGNORE INTO Words (word_id, word_text, pronunciation)
    VALUES (p_word_id, p_word_text, p_pronunciation);

    -- Thêm nghĩa vào bảng WordMeanings
    INSERT INTO WordMeanings (meaning_id, word_id, word_type_id, meaning_label, meaning_text)
    VALUES (p_meaning_id, p_word_id, p_word_type_id, p_meaning_label, p_meaning_text);

    -- Thêm bản dịch tiếng Anh
    INSERT INTO Translations (translation_id, meaning_id, language, translated_text, pronunciation)
    VALUES (p_translation_en_id, p_meaning_id, 'en', p_translation_en, p_pronunciation_en);

    -- Thêm bản dịch tiếng Nhật
    INSERT INTO Translations (translation_id, meaning_id, language, translated_text, pronunciation)
    VALUES (p_translation_ja_id, p_meaning_id, 'ja', p_translation_ja, p_pronunciation_ja);

    -- Thêm ví dụ
    INSERT INTO Examples (example_id, meaning_id, example_text, translation_en, translation_ja)
    VALUES (p_example_id, p_meaning_id, p_example_text, p_example_en, p_example_ja);
END //

DELIMITER ;

-- Từ 1: đông (nhiều nghĩa đồng âm, nhiều từ loại)
CALL AddFullWord(1,'đông','do^ng',1,1,'mùa đông','Thời kỳ lạnh nhất trong năm',1,'winter','ˈwɪntər',2,'冬','fuyu',1,'Mùa đông ở miền Bắc rất lạnh.','Winter in the North is very cold.','北の冬はとても寒いです。');
CALL AddFullWord(1,'đông','do^ng',2,1,'phía đông','Phương hướng nằm phía mặt trời mọc',3,'east','iːst',4,'東','higashi',2,'Nhà tôi ở phía đông thành phố.','My house is in the east of the city.','私の家は市の東側にあります。');
CALL AddFullWord(1,'đông','do^ng',3,3,'đông đúc','Có nhiều người, vật ở một chỗ',5,'crowded','kraʊdɪd',6,'混雑した','konzatsu',3,'Chợ rất đông đúc vào cuối tuần.','The market is very crowded on weekends.','週末の市場はとても混雑しています。');
CALL AddFullWord(1,'đông','do^ng',4,1,'đám đông','Nhóm người tụ tập lại',7,'crowd','kraʊd',8,'群衆','gunshuu',4,'Đám đông tụ tập trước sân vận động.','A crowd gathered in front of the stadium.','スタジアムの前に群衆が集まりました。');
CALL AddFullWord(1,'đông','do^ng',5,2,'đông lại','Trạng thái chuyển từ lỏng sang rắn do nhiệt độ thấp',9,'to freeze','friːz',10,'凍る','kooru',5,'Nước đông lại khi gặp lạnh.','Water freezes when it gets cold.','水は寒いと凍ります。');

-- Từ 2: học
CALL AddFullWord(2,'học','hoc',6,2,'học tập','Tiếp thu kiến thức, rèn luyện kỹ năng',11,'to study','study',12,'学ぶ','manabu',6,'Tôi thích học tiếng Anh.','I like studying English.','私は英語を学ぶのが好きです。');

-- Từ 3: mẹ
CALL AddFullWord(3,'mẹ','me',7,1,'mẹ','Người phụ nữ sinh ra và nuôi dưỡng con',13,'mother','mother',14,'母','haha',7,'Mẹ là người tuyệt vời nhất.','Mother is the most wonderful person.','母は最も素晴らしい人です。');

-- Từ 4: đẹp
CALL AddFullWord(4,'đẹp','dep',8,3,'đẹp','Có vẻ ngoài dễ nhìn, hấp dẫn',15,'beautiful','beautiful',16,'美しい','utsukushii',8,'Hoa này rất đẹp.','This flower is very beautiful.','この花はとても美しいです。');

-- Từ 5: ăn
CALL AddFullWord(5,'ăn','an',9,2,'ăn','Đưa thức ăn vào cơ thể',17,'to eat','eat',18,'食べる','taberu',9,'Tôi ăn sáng lúc 7 giờ.','I have breakfast at 7 o\'clock.','私は7時に朝ご飯を食べます。');

-- Từ 6: trường
CALL AddFullWord(6,'trường','truong',10,1,'trường học','Nơi học tập, giáo dục',19,'school','school',20,'学校','gakkou',10,'Trường tôi cách nhà 2km.','My school is 2km from home.','私の学校は家から2kmです。');

-- Từ 7: cao
CALL AddFullWord(7,'cao','cao',11,3,'cao','Có chiều cao lớn',21,'tall/high','tall',22,'高い','takai',11,'Tòa nhà này rất cao.','This building is very tall.','このビルはとても高いです。');

-- Từ 8: bạn
CALL AddFullWord(8,'bạn','ban',12,1,'bạn','Người cùng chơi, cùng học',23,'friend','friend',24,'友達','tomodachi',12,'Bạn là người tốt.','You are a good friend.','あなたは良い友達です。');

-- Từ 9: nhanh
CALL AddFullWord(9,'nhanh','nhanh',13,3,'nhanh','Di chuyển hoặc thực hiện việc gì trong thời gian ngắn',25,'fast','fast',26,'速い','hayai',13,'Bạn chạy rất nhanh.','You run very fast.','あなたはとても速く走ります。');

-- Từ 10: trái
CALL AddFullWord(10,'trái','trai',14,1,'quả cây','Phần sinh sản của cây, thường ăn được',27,'fruit','fruit',28,'果物','kudamono',14,'Tôi thích ăn trái cây.','I like eating fruit.','私は果物を食べるのが好きです。');

-- Từ 11: nước
CALL AddFullWord(11,'nước','nuoc',15,1,'chất lỏng','Chất lỏng trong suốt, không màu, không mùi và không vị',29,'water','water',30,'水','mizu',15,'Làm ơn cho tôi một cốc nước.','Please give me a glass of water.','水を一杯ください。');
CALL AddFullWord(11,'nước','nuoc',16,1,'quốc gia','Một quốc gia với chính phủ riêng',31,'country','country',32,'国','kuni',16,'Nước Việt Nam rất tươi đẹp.','Vietnam is a beautiful country.','ベトナムは美しい国です。');

-- Từ 12: nói
CALL AddFullWord(12,'nói','noi',17,2,'phát ra lời','Phát ra lời để truyền đạt thông tin',33,'to say','say',34,'言う','iu',17,'Anh ấy nói rằng anh ấy sẽ đến muộn.','He said that he would be late.','彼は遅れると言いました。');

-- Từ 13: nhà
CALL AddFullWord(13,'nhà','nha',18,1,'nơi ở','Tòa nhà để ở, nơi một người hoặc một gia đình sinh sống',35,'house','house',36,'家','ie',18,'Gia đình tôi vừa chuyển đến một ngôi nhà mới.','My family just moved to a new house.','私の家族は新しい家に引っ越したばかりです。');

-- Từ 14: làm
CALL AddFullWord(14,'làm','lam',19,2,'thực hiện hành động','Tiến hành, hoàn thành một hành động, nhiệm vụ',37,'to do','do',38,'する','suru',19,'Bạn đang làm gì vậy?','What are you doing?','何をしていますか？');

-- Từ 15: đi
CALL AddFullWord(15,'đi','di',20,2,'di chuyển','Di chuyển bằng chân từ nơi này đến nơi khác',39,'to go','go',40,'行く','iku',20,'Tôi đi học mỗi ngày.','I go to school every day.','毎日学校に行きます。');

-- Từ 16: chạy
CALL AddFullWord(16,'chạy','chay',21,2,'di chuyển nhanh','Di chuyển với tốc độ nhanh bằng chân',41,'to run','run',42,'走る','hashiru',21,'Cậu ấy chạy rất nhanh.','He runs very fast.','彼はとても速く走ります。');

-- Từ 17: đứng
CALL AddFullWord(17,'đứng','dung',22,2,'không ngồi','Ở trạng thái thẳng, không ngồi hoặc nằm',43,'to stand','stand',44,'立つ','tatsu',22,'Xin hãy đứng lên.','Please stand up.','立ってください。');

-- Từ 18: ngồi
CALL AddFullWord(18,'ngồi','ngoi',23,2,'ở tư thế ngồi','Ở trạng thái đặt cơ thể lên một vật để nghỉ',45,'to sit','sit',46,'座る','suwaru',23,'Mời bạn ngồi.','Please sit down.','座ってください。');

-- Từ 19: ngủ
CALL AddFullWord(19,'ngủ','ngu',24,2,'nghỉ ngơi','Trạng thái nghỉ ngơi tự nhiên của cơ thể',47,'to sleep','sleep',48,'寝る','neru',24,'Tôi ngủ lúc mười một giờ.','I go to sleep at eleven o\'clock.','私は11時に寝ます。');

-- Từ 20: mở
CALL AddFullWord(20,'mở','mo',25,2,'làm cho thông','Làm cho một vật chuyển từ trạng thái đóng sang trạng thái thông',49,'to open','open',50,'開ける','akeru',25,'Mở cửa ra nhé.','Please open the door.','ドアを開けてください。');

-- Từ 21: đóng
CALL AddFullWord(21,'đóng','dong',26,2,'làm kín','Làm cho một vật chuyển sang trạng thái kín',51,'to close','close',52,'閉める','shimeru',26,'Đóng cửa lại giúp tôi.','Please close the door for me.','ドアを閉めてください。');

-- Từ 22: sớm
CALL AddFullWord(22,'sớm','som',27,4,'thời gian trước','Xảy ra trước dự định hoặc bình thường',53,'early','early',54,'早い','hayai',27,'Anh ấy đến rất sớm.','He arrived very early.','彼はとても早く到着しました。');

-- Từ 23: muộn
CALL AddFullWord(23,'muộn','muon',28,4,'thời gian sau','Xảy ra sau thời gian dự định',55,'late','late',56,'遅い','osoi',28,'Tôi về nhà muộn.','I came home late.','私は遅く帰りました。');

-- Từ 24: lớn
CALL AddFullWord(24,'lớn','lon',29,3,'kích thước to','Có kích thước hoặc số lượng vượt trội',57,'big','big',58,'大きい','ookii',29,'Căn phòng này rất lớn.','This room is very big.','この部屋はとても大きいです。');

-- Từ 25: nhỏ
CALL AddFullWord(25,'nhỏ','nho',30,3,'kích thước bé','Có kích thước bé hoặc số lượng ít',59,'small','small',60,'小さい','chiisai',30,'Chiếc hộp này rất nhỏ.','This box is very small.','この箱はとても小さいです。');

-- Từ 26: xa
CALL AddFullWord(26,'xa','xa',31,3,'khoảng cách lớn','Có khoảng cách lớn',61,'far','far',62,'遠い','tooi',31,'Nhà tôi cách trường rất xa.','My house is very far from school.','私の家は学校からとても遠いです。');

-- Từ 27: gần
CALL AddFullWord(27,'gần','gan',32,3,'khoảng cách nhỏ','Có khoảng cách nhỏ',63,'near','near',64,'近い','chikai',32,'Cửa hàng gần nhà tôi.','The store is near my house.','店は私の家の近くにあります。');

-- Từ 28: vui
CALL AddFullWord(28,'vui','vui',33,3,'cảm xúc tích cực','Cảm giác hạnh phúc, phấn khích',65,'happy','happy',66,'嬉しい','ureshii',33,'Tôi cảm thấy rất vui hôm nay.','I feel very happy today.','今日はとても嬉しいです。');

-- Từ 29: buồn
CALL AddFullWord(29,'buồn','buon',34,3,'cảm xúc tiêu cực','Cảm giác không vui, thất vọng',67,'sad','sad',68,'悲しい','kanashii',34,'Cô ấy buồn vì điểm thấp.','She is sad because of the low score.','彼女は点数が低くて悲しいです。');

-- Từ 30: trắng
CALL AddFullWord(30,'trắng','trang',35,3,'màu trắng','Màu sắc như tuyết hoặc sữa',69,'white','white',70,'白い','shiroi',35,'Áo sơ mi màu trắng.','White shirt.','白いシャツ。');

-- Từ 31: đen
CALL AddFullWord(31,'đen','den',36,3,'màu đen','Màu sắc như than hoặc bóng tối',71,'black','black',72,'黒い','kuroi',36,'Tóc của anh ấy màu đen.','His hair is black.','彼の髪は黒いです。');

-- Từ 32: đỏ
CALL AddFullWord(32,'đỏ','do',37,3,'màu đỏ','Màu sắc như máu hoặc hoa hồng',73,'red','red',74,'赤い','akai',37,'Hoa hồng màu đỏ.','Red rose.','赤いバラ。');

-- Từ 33: vàng
CALL AddFullWord(33,'vàng','vang',38,3,'màu vàng','Màu sắc như mặt trời hoặc hoa hướng dương',75,'yellow','yellow',76,'黄色い','kiiroi',38,'Bông hoa màu vàng.','Yellow flower.','黄色い花。');

-- Từ 34: xanh
CALL AddFullWord(34,'xanh','xanh',39,3,'màu xanh','Màu của trời hoặc lá cây',77,'blue/green','blue',78,'青い','aoi',39,'Bầu trời màu xanh.','The sky is blue.','空は青いです。');

-- Từ 35: thầy
CALL AddFullWord(35,'thầy','thay',40,1,'giáo viên nam','Người nam dạy học',79,'male teacher','teacher',80,'先生','sensei',40,'Thầy giáo dạy môn Toán.','The teacher teaches Math.','先生は数学を教えています。');

-- Từ 36: cô
CALL AddFullWord(36,'cô','co',41,1,'giáo viên nữ','Người nữ dạy học',81,'female teacher','teacher',82,'先生','sensei',41,'Cô giáo dạy văn.','The teacher teaches Literature.','先生は国語を教えています。');

-- Từ 37: bạn
CALL AddFullWord(37,'bạn','ban',42,1,'bạn bè','Người cùng chơi, cùng học',83,'friend','friend',84,'友達','tomodachi',42,'Bạn thân của tôi.','My best friend.','親友。');

-- Từ 38: anh
CALL AddFullWord(38,'anh','anh',43,5,'anh trai','Người con trai lớn hơn trong gia đình',85,'older brother','brother',86,'兄','ani',43,'Anh trai tôi học đại học.','My older brother studies at university.','兄は大学で勉強しています。');

-- Từ 39: chị
CALL AddFullWord(39,'chị','chi',44,5,'chị gái','Người con gái lớn hơn trong gia đình',87,'older sister','sister',88,'姉','ane',44,'Chị gái tôi làm bác sĩ.','My older sister is a doctor.','姉は医者です。');

-- Từ 40: em
CALL AddFullWord(40,'em','em',45,5,'em','Người nhỏ tuổi hơn trong gia đình',89,'younger sibling','sibling',90,'弟/妹','otouto/imouto',45,'Em tôi học lớp 5.','My younger sibling is in grade 5.','弟は5年生です。');

-- Từ 41: ông
CALL AddFullWord(41,'ông','ong',46,1,'ông nội','Bố của bố',91,'grandfather','grandfather',92,'祖父','sofu',46,'Ông nội tôi thích đọc báo.','My grandfather likes reading newspapers.','祖父は新聞を読むのが好きです。');

-- Từ 42: bà
CALL AddFullWord(42,'bà','ba',47,1,'bà ngoại','Mẹ của mẹ',93,'grandmother','grandmother',94,'祖母','sobo',47,'Bà ngoại tôi nấu ăn rất ngon.','My grandmother cooks very well.','祖母は料理がとても上手です。');

-- Từ 43: cửa
CALL AddFullWord(43,'cửa','cua',48,1,'lối ra vào','Vật ngăn cách giữa các không gian, có thể mở ra đóng lại',95,'door','door',96,'ドア','doa',48,'Cửa nhà bạn màu gì?','What color is your door?','あなたの家のドアは何色ですか？');

-- Từ 44: bàn
CALL AddFullWord(44,'bàn','ban',49,1,'mặt phẳng để làm việc','Vật để viết, học hoặc đặt đồ',97,'table','table',98,'テーブル','teeburu',49,'Bàn học của tôi rất gọn gàng.','My study table is tidy.','私の勉強机はとてもきれいです。');

-- Từ 45: ghế
CALL AddFullWord(45,'ghế','ghe',50,1,'vật để ngồi','Vật dùng để ngồi',99,'chair','chair',100,'椅子','isu',50,'Ghế này rất thoải mái.','This chair is very comfortable.','この椅子はとても快適です。');

-- Từ 46: sách
CALL AddFullWord(46,'sách','sach',51,1,'ấn phẩm chữ viết','Tác phẩm in hoặc viết gồm nhiều trang',101,'book','book',102,'本','hon',51,'Tôi thích đọc sách.','I like reading books.','私は本を読むのが好きです。');

-- Từ 47: bút
CALL AddFullWord(47,'bút','but',52,1,'dụng cụ viết','Vật dùng để viết',103,'pen','pen',104,'ペン','pen',52,'Bút này viết rất trơn.','This pen writes smoothly.','このペンはとても滑らかに書けます。');

-- Từ 48: xe
CALL AddFullWord(48,'xe','xe',53,1,'phương tiện di chuyển','Vật dùng để vận chuyển người hoặc hàng hóa',105,'vehicle','car',106,'車','kuruma',53,'Tôi đi xe đạp đến trường.','I ride a bicycle to school.','私は自転車で学校に行きます。');

-- Từ 49: máy
CALL AddFullWord(49,'máy','may',54,1,'thiết bị cơ học','Thiết bị sử dụng để thực hiện công việc',107,'machine','machine',108,'機械','kikai',54,'Máy tính của tôi rất hiện đại.','My computer is very modern.','私のコンピューターはとても現代的です。');

-- Từ 50: mắt
CALL AddFullWord(50,'mắt','mat',55,1,'bộ phận nhìn','Bộ phận giúp nhìn thấy',109,'eye','eye',110,'目','me',55,'Mắt tôi bị cận.',"My eyes are nearsighted.",'私は近視です。');

-- Từ 51: tai
CALL AddFullWord(51,'tai','tai',56,1,'bộ phận nghe','Bộ phận giúp nghe',111,'ear','ear',112,'耳','mimi',56,'Tai tôi nghe rất tốt.','My ears hear very well.','私の耳はよく聞こえます。');

-- Từ 52: mũi
CALL AddFullWord(52,'mũi','mui',57,1,'bộ phận ngửi','Bộ phận giúp ngửi',113,'nose','nose',114,'鼻','hana',57,'Mũi tôi bị nghẹt.','My nose is blocked.','鼻が詰まっています。');

-- Từ 53: miệng
CALL AddFullWord(53,'miệng','mieng',58,1,'bộ phận ăn nói','Bộ phận giúp ăn, nói',115,'mouth','mouth',116,'口','kuchi',58,'Miệng bạn đang nói gì?','What are you saying?','あなたは何を話していますか？');

-- Từ 54: tay
CALL AddFullWord(54,'tay','tay',59,1,'bộ phận cầm nắm','Bộ phận dùng để cầm nắm',117,'hand','hand',118,'手','te',59,'Tay tôi bị đau.','My hand hurts.','手が痛いです。');

-- Từ 55: chân
CALL AddFullWord(55,'chân','chan',60,1,'bộ phận đi lại','Bộ phận dùng để đi lại',119,'leg','leg',120,'足','ashi',60,'Chân bạn dài quá.','Your legs are long.','あなたの足は長いです。');

-- Từ 56: tim
CALL AddFullWord(56,'tim','tim',61,1,'bộ phận bơm máu','Bộ phận bơm máu trong cơ thể',121,'heart','heart',122,'心臓','shinzou',61,'Tim tôi đập nhanh.','My heart beats fast.','心臓が速く鼓動しています。');

-- Từ 57: đầu
CALL AddFullWord(57,'đầu','dau',62,1,'phần trên cơ thể','Phần trên cùng của cơ thể',123,'head','head',124,'頭','atama',62,'Đầu tôi bị đau.','My head hurts.','頭が痛いです。');

-- Từ 58: trời
CALL AddFullWord(58,'trời','troi',63,1,'bầu trời','Không gian phía trên mặt đất',125,'sky','sky',126,'空','sora',63,'Trời hôm nay trong xanh.','The sky is clear today.','今日は空が澄んでいます。');

-- Từ 59: đất
CALL AddFullWord(59,'đất','dat',64,1,'mặt đất','Bề mặt của hành tinh',127,'ground','earth',128,'地面','jimen',64,'Đất ở đây màu nâu.','The soil here is brown.','ここの土は茶色です。');

-- Từ 60: nước
CALL AddFullWord(60,'nước','nuoc',65,1,'nước uống','Chất lỏng để uống',129,'water','water',130,'水','mizu',65,'Uống nước mỗi ngày.','Drink water every day.','毎日水を飲みましょう。');

-- Từ 61: lửa
CALL AddFullWord(61,'lửa','lua',66,1,'năng lượng nóng','Năng lượng phát ra từ sự cháy',131,'fire','fire',132,'火','hi',66,'Lửa cháy rất mạnh.','The fire burns strongly.','火が激しく燃えています。');

-- Từ 62: gió
CALL AddFullWord(62,'gió','gio',67,1,'dòng khí','Không khí chuyển động',133,'wind','wind',134,'風','kaze',67,'Gió thổi mát mẻ.','The wind blows coolly.','風が涼しく吹いています。');

-- Từ 63: mưa
CALL AddFullWord(63,'mưa','mua',68,1,'nước từ trời','Nước rơi từ trên trời xuống',135,'rain','rain',136,'雨','ame',68,'Hôm nay trời mưa.','It is raining today.','今日は雨です。');

-- Từ 64: nắng
CALL AddFullWord(64,'nắng','nang',69,1,'ánh sáng mặt trời','Ánh sáng chiếu từ mặt trời',137,'sunshine','sunshine',138,'日差し','hizashi',69,'Nắng hôm nay rất gay gắt.','The sunshine is strong today.','今日は日差しが強いです。');

-- Từ 65: hoa
CALL AddFullWord(65,'hoa','hoa',70,1,'phần đẹp của cây','Phần sinh sản của cây, thường có màu sắc đẹp',139,'flower','flower',140,'花','hana',70,'Hoa hồng màu đỏ.','Red rose.','赤いバラ。');

-- Từ 66: cây
CALL AddFullWord(66,'cây','cay',71,1,'thực vật lớn','Thực vật có thân gỗ',141,'tree','tree',142,'木','ki',71,'Cây cao bóng mát.','Tall tree gives shade.','高い木が日陰を作ります。');

-- Từ 67: lá
CALL AddFullWord(67,'lá','la',72,1,'bộ phận cây','Phần màu xanh của cây',143,'leaf','leaf',144,'葉','ha',72,'Lá cây chuyển màu vàng.','Leaves turn yellow.','葉が黄色に変わります。');

-- Từ 68: quả
CALL AddFullWord(68,'quả','qua',73,1,'phần sinh sản của cây','Phần có hạt, thường ăn được',145,'fruit','fruit',146,'果実','kajitsu',73,'Quả cam rất ngọt.','Orange is very sweet.','オレンジはとても甘いです。');

-- Từ 69: bầu
CALL AddFullWord(69,'bầu','bau',74,1,'loại quả','Loại quả dài, màu xanh',147,'gourd','gourd',148,'ひょうたん','hyoutan',74,'Bầu luộc chấm mắm rất ngon.','Boiled gourd is delicious with fish sauce.','ひょうたんは魚醤と一緒に食べると美味しいです。');

-- Từ 70: sông
CALL AddFullWord(70,'sông','song',75,1,'dòng nước lớn','Dòng nước chảy trên mặt đất',149,'river','river',150,'川','kawa',75,'Sông Hồng chảy qua Hà Nội.','The Red River flows through Hanoi.','紅河はハノイを流れています。');

-- Từ 71: biển
CALL AddFullWord(71,'biển','bien',76,1,'vùng nước mặn lớn','Vùng nước mặn lớn hơn hồ',151,'sea','sea',152,'海','umi',76,'Biển miền Trung rất đẹp.','The sea in Central Vietnam is beautiful.','中部の海はとてもきれいです。');

-- Từ 72: hồ
CALL AddFullWord(72,'hồ','ho',77,1,'vùng nước ngọt','Vùng nước ngọt tự nhiên hoặc nhân tạo',153,'lake','lake',154,'湖','mizuumi',77,'Hồ Tây ở Hà Nội rất rộng.','West Lake in Hanoi is very large.','ハノイの西湖はとても広いです。');

-- Từ 73: núi
CALL AddFullWord(73,'núi','nui',78,1,'địa hình cao','Địa hình cao hơn mặt đất xung quanh',155,'mountain','mountain',156,'山','yama',78,'Núi Phú Sĩ ở Nhật Bản.','Mount Fuji is in Japan.','富士山は日本にあります。');

-- Từ 74: đồng
CALL AddFullWord(74,'đồng','dong',79,1,'cánh đồng','Khu vực đất rộng để trồng trọt',157,'field','field',158,'畑','hatake',79,'Đồng lúa xanh mướt.','Green rice field.','青々とした田んぼ。');

-- Từ 75: rừng
CALL AddFullWord(75,'rừng','rung',80,1,'khu vực cây cối','Khu vực có nhiều cây cối',159,'forest','forest',160,'森','mori',80,'Rừng nhiệt đới rất phong phú.','Rainforest is very rich.','熱帯雨林はとても豊かです。');

-- Từ 76: trời
CALL AddFullWord(76,'trời','troi',81,1,'bầu trời','Không gian phía trên mặt đất',161,'sky','sky',162,'空','sora',81,'Trời hôm nay trong xanh.','The sky is clear today.','今日は空が澄んでいます。');

-- Từ 77: đất
CALL AddFullWord(77,'đất','dat',82,1,'mặt đất','Bề mặt của hành tinh',163,'ground','earth',164,'地面','jimen',82,'Đất ở đây màu nâu.','The soil here is brown.','ここの土は茶色です。');

-- Từ 78: chim
CALL AddFullWord(78,'chim','chim',83,1,'động vật biết bay','Động vật biết bay bằng cánh',165,'bird','bird',166,'鳥','tori',83,'Chim hót líu lo.','Birds are singing.','鳥がさえずっています。');

-- Từ 79: cá
CALL AddFullWord(79,'cá','ca',84,1,'động vật dưới nước','Động vật sống dưới nước',167,'fish','fish',168,'魚','sakana',84,'Cá sống ở ao.','Fish live in ponds.','魚は池に住んでいます。');

-- Từ 80: chó
CALL AddFullWord(80,'chó','cho',85,1,'động vật nuôi','Động vật nuôi, trung thành với con người',169,'dog','dog',170,'犬','inu',85,'Chó là bạn của con người.','Dogs are human\'s friends.','犬は人間の友達です。');

-- Từ 81: mèo
CALL AddFullWord(81,'mèo','meo',86,1,'động vật nuôi','Động vật nuôi, thích sự yên tĩnh',171,'cat','cat',172,'猫','neko',86,'Mèo thích nằm ngủ.','Cats like sleeping.','猫は寝るのが好きです。');

-- Từ 82: ngựa
CALL AddFullWord(82,'ngựa','ngua',87,1,'động vật có móng','Động vật có móng, dùng để vận chuyển',173,'horse','horse',174,'馬','uma',87,'Ngựa chạy rất khỏe.','Horses run strongly.','馬はとても力強く走ります。');

-- Từ 83: gà
CALL AddFullWord(83,'gà','ga',88,1,'động vật nuôi','Động vật nuôi, cho trứng',175,'chicken','chicken',176,'鶏','niwatori',88,'Gà đẻ trứng mỗi ngày.','Chicken lays eggs every day.','鶏は毎日卵を産みます。');

-- Từ 84: vịt
CALL AddFullWord(84,'vịt','vit',89,1,'động vật dưới nước','Động vật sống dưới nước và trên cạn',177,'duck','duck',178,'アヒル','ahiru',89,'Vịt bơi rất giỏi.','Duck swims very well.','アヒルは泳ぎが得意です。');

-- Từ 85: ngỗng
CALL AddFullWord(85,'ngỗng','ngong',90,1,'động vật dưới nước','Động vật lớn hơn vịt',179,'goose','goose',180,'ガチョウ','gachou',90,'Ngỗng kêu rất to.','Goose makes loud noise.','ガチョウは大きな声で鳴きます。');

-- Từ 86: chuột
CALL AddFullWord(86,'chuột','chuot',91,1,'động vật nhỏ','Động vật có thân nhỏ, nhanh nhẹn',181,'mouse','mouse',182,'ネズミ','nezumi',91,'Chuột thích ăn phô mai.','Mouse likes cheese.','ネズミはチーズが好きです。');

-- Từ 87: voi
CALL AddFullWord(87,'voi','voi',92,1,'động vật lớn','Động vật lớn, có vòi dài',183,'elephant','elephant',184,'象','zou',92,'Voi ăn cỏ.','Elephants eat grass.','象は草を食べます。');

-- Từ 88: sữa
CALL AddFullWord(88,'sữa','sua',93,1,'thức uống','Thức uống bổ dưỡng',185,'milk','milk',186,'牛乳','gyuunyuu',93,'Sữa tốt cho sức khỏe.','Milk is good for health.','牛乳は健康に良いです。');

-- Từ 89: cơm
CALL AddFullWord(89,'cơm','com',94,1,'thức ăn chính','Thức ăn chính của người Việt',187,'rice','rice',188,'ご飯','gohan',94,'Cơm trắng thơm ngon.','White rice is delicious.','白いご飯は美味しいです。');

-- Từ 90: phở
CALL AddFullWord(90,'phở','pho',95,1,'món ăn nổi tiếng','Món ăn nổi tiếng của Việt Nam',189,'pho','pho',190,'フォー','fo',95,'Phở bò Hà Nội rất ngon.','Hanoi beef pho is delicious.','ハノイの牛肉フォーはとても美味しいです。');

-- Từ 91: bánh
CALL AddFullWord(91,'bánh','banh',96,1,'thức ăn','Món ăn làm từ bột',191,'cake','cake',192,'ケーキ','keeki',96,'Bánh mì rất phổ biến.','Bread is very popular.','パンはとても人気です。');

-- Từ 92: kẹo
CALL AddFullWord(92,'kẹo','keo',97,1,'món ngọt','Thức ăn vị ngọt',193,'candy','candy',194,'飴','ame',97,'Kẹo này rất ngọt.','This candy is very sweet.','この飴はとても甘いです。');

-- Từ 93: nước ngọt
CALL AddFullWord(93,'nước ngọt','nuoc ngot',98,1,'đồ uống','Đồ uống có ga hoặc vị ngọt',195,'soft drink','drink',196,'ジュース','juusu',98,'Nước ngọt có nhiều loại.','There are many kinds of soft drinks.','ジュースには多くの種類があります。');

-- Từ 94: cà phê
CALL AddFullWord(94,'cà phê','ca phe',99,1,'đồ uống','Đồ uống pha từ hạt cà phê',197,'coffee','coffee',198,'コーヒー','koohii',99,'Cà phê giúp tỉnh táo.','Coffee helps to stay awake.','コーヒーは目を覚ますのに役立ちます。');

-- Từ 95: trà
CALL AddFullWord(95,'trà','tra',100,1,'đồ uống','Đồ uống pha từ lá trà',199,'tea','tea',200,'お茶','ocha',100,'Trà xanh tốt cho sức khỏe.','Green tea is good for health.','緑茶は健康に良いです。');

-- Từ 96: nước ép
CALL AddFullWord(96,'nước ép','nuoc ep',101,1,'đồ uống','Đồ uống ép từ hoa quả',201,'juice','juice',202,'ジュース','juusu',101,'Nước ép cam bổ dưỡng.','Orange juice is nutritious.','オレンジジュースは栄養があります。');

-- Từ 97: rượu
CALL AddFullWord(97,'rượu','ruou',102,1,'đồ uống có cồn','Đồ uống lên men chứa cồn',203,'alcohol','alcohol',204,'酒','sake',102,'Rượu vang đỏ rất ngon.','Red wine is delicious.','赤ワインは美味しいです。');

-- Từ 98: bia
CALL AddFullWord(98,'bia','bia',103,1,'đồ uống có cồn','Đồ uống có cồn làm từ lúa mạch',205,'beer','beer',206,'ビール','biiru',103,'Bia lạnh uống rất mát.','Cold beer is refreshing.','冷たいビールは気持ちいいです。');

-- Từ 99: tiền
CALL AddFullWord(99,'tiền','tien',104,1,'phương tiện trao đổi','Phương tiện trao đổi giá trị',207,'money','money',208,'お金','okane',104,'Tiền giúp mua sắm.','Money helps to buy things.','お金は買い物に役立ちます。');

-- Từ 100: vàng
CALL AddFullWord(100,'vàng','vang',105,1,'kim loại quý','Kim loại quý có giá trị cao',209,'gold','gold',210,'金','kin',105,'Vàng có giá trị lớn.','Gold is valuable.','金は価値があります。');

```

## 5. Ví dụ truy vấn tìm từ

```sql
DELIMITER //

CREATE PROCEDURE GetWordFullInfo(IN p_word_text VARCHAR(255))
BEGIN
    SELECT
        w.word_id,
        w.word_text,
        w.pronunciation AS word_pronunciation,
        wm.meaning_id,
        wm.meaning_label,
        wm.meaning_text,
        wt.type_name AS word_type,
        te.translated_text AS translation_en,
        te.pronunciation AS pronunciation_en,
        tj.translated_text AS translation_ja,
        tj.pronunciation AS pronunciation_ja,
        e.example_text,
        e.translation_en AS example_en,
        e.translation_ja AS example_ja
    FROM Words w
    JOIN WordMeanings wm ON w.word_id = wm.word_id
    JOIN WordTypes wt ON wm.word_type_id = wt.word_type_id
    LEFT JOIN Translations te ON wm.meaning_id = te.meaning_id AND te.language = 'en'
    LEFT JOIN Translations tj ON wm.meaning_id = tj.meaning_id AND tj.language = 'ja'
    LEFT JOIN Examples e ON wm.meaning_id = e.meaning_id
    WHERE w.word_text = p_word_text;
END //

DELIMITER ;

CALL GetWordFullInfo('đông')
```
- **Kết quả**
![](https://github.com/user-attachments/assets/6d23a44c-cfc5-4075-ad9e-ea501ced83bc)

