INSERT INTO WordTypes (type_name) VALUES
('Noun'),
('Verb'),
('Adjective'),
('Adverb'),
('Pronoun'),
('Preposition'),
('Conjunction'),
('Interjection');

INSERT INTO Words (word_text, pronunciation) VALUES
('đông', 'do^ng'),
('học', 'hoc'),
('mẹ', 'me'),
('đẹp', 'dep'),
('ăn', 'an'),
('trường', 'truong'),
('cao', 'cao'),
('bạn', 'ban'),
('nhanh', 'nhanh'),
('trái', 'trai');

INSERT INTO WordMeanings (word_id, word_type_id, meaning_text) VALUES
(1, 1, 'mùa đông, thời kỳ lạnh nhất trong năm'),      -- đông, Noun
(1, 3, 'đông đúc, đông vui'),                        -- đông, Adjective
(1, 1, 'phía đông'),                                 -- đông, Noun
(1, 2, 'đông lại, đông cứng'),                       -- đông, Verb
(2, 2, 'tiếp thu kiến thức, rèn luyện kỹ năng'),      -- học, Verb
(3, 1, 'người phụ nữ sinh ra và nuôi dưỡng con'),     -- mẹ, Noun
(4, 3, 'có vẻ ngoài dễ nhìn, hấp dẫn'),               -- đẹp, Adjective
(5, 2, 'đưa thức ăn vào cơ thể'),                     -- ăn, Verb
(6, 1, 'nơi học tập, giáo dục'),                      -- trường, Noun
(7, 3, 'có chiều cao lớn'),                           -- cao, Adjective
(8, 1, 'người cùng chơi, cùng học'),                  -- bạn, Noun
(9, 3, 'di chuyển hoặc thực hiện việc gì trong thời gian ngắn'), -- nhanh, Adjective
(10, 1, 'quả cây'),                                   -- trái, Noun
(10, 1, 'bên trái, phía trái');                       -- trái, Noun (ý nghĩa thứ 2)

INSERT INTO Translations (meaning_id, language, translated_text, pronunciation) VALUES
(1, 'en', 'winter, the coldest season of the year', 'winter'),
(1, 'ja', '冬 (ふゆ, fuyu)', 'fuyu'),
(2, 'en', 'crowded, lively', 'crowded'),
(2, 'ja', '賑やか (にぎやか, nigiyaka)', 'nigiyaka'),
(3, 'en', 'the east, eastern direction', 'east'),
(3, 'ja', '東 (ひがし, higashi)', 'higashi'),
(4, 'en', 'to freeze, become solid', 'freeze'),
(4, 'ja', '凍る (こおる, kōru)', 'kōru'),
(5, 'en', 'to study, to learn', 'study'),
(5, 'ja', '学ぶ (まなぶ, manabu)', 'manabu'),
(6, 'en', 'mother', 'mother'),
(6, 'ja', '母 (はは, haha)', 'haha'),
(7, 'en', 'beautiful, pretty', 'beautiful'),
(7, 'ja', '美しい (うつくしい, utsukushii)', 'utsukushii'),
(8, 'en', 'to eat', 'eat'),
(8, 'ja', '食べる (たべる, taberu)', 'taberu'),
(9, 'en', 'school', 'school'),
(9, 'ja', '学校 (がっこう, gakkō)', 'gakkō'),
(10, 'en', 'high, tall', 'high'),
(10, 'ja', '高い (たかい, takai)', 'takai'),
(11, 'en', 'friend', 'friend'),
(11, 'ja', '友達 (ともだち, tomodachi)', 'tomodachi'),
(12, 'en', 'fast, quick', 'fast'),
(12, 'ja', '速い (はやい, hayai)', 'hayai'),
(13, 'en', 'fruit', 'fruit'),
(13, 'ja', '果物 (くだもの, kudamono)', 'kudamono'),
(14, 'en', 'left side', 'left'),
(14, 'ja', '左 (ひだり, hidari)', 'hidari');

INSERT INTO Examples (meaning_id, example_text, translation_en, translation_ja) VALUES
(1, 'Mùa đông ở miền Bắc rất lạnh.', 'Winter in the North is very cold.', '北の冬はとても寒いです。'),
(2, 'Chợ rất đông đúc vào cuối tuần.', 'The market is very crowded on weekends.', '週末には市場がとても賑やかです。'),
(3, 'Nhà tôi ở phía đông thành phố.', 'My house is in the east of the city.', '私の家は市の東側にあります。'),
(4, 'Nước đông lại khi trời lạnh.', 'Water freezes when it is cold.', '水は寒いと凍ります。'),
(5, 'Tôi thích học tiếng Anh.', 'I like studying English.', '私は英語を学ぶのが好きです。'),
(6, 'Mẹ là người tuyệt vời nhất.', 'Mother is the most wonderful person.', '母は最も素晴らしい人です。'),
(7, 'Hoa này rất đẹp.', 'This flower is very beautiful.', 'この花はとても美しいです。'),
(8, 'Tôi ăn sáng lúc 7 giờ.', 'I have breakfast at 7 o\'clock.', '私は7時に朝ご飯を食べます。'),
(9, 'Trường tôi cách nhà 2km.', 'My school is 2km from home.', '私の学校は家から2kmです。'),
(10, 'Cây này rất cao.', 'This tree is very tall.', 'この木はとても高いです。'),
(11, 'Bạn của tôi rất thân thiện.', 'My friend is very friendly.', '私の友達はとても親切です。'),
(12, 'Cô ấy chạy rất nhanh.', 'She runs very fast.', '彼女はとても速く走ります。'),
(13, 'Tôi thích ăn trái cây.', 'I like eating fruits.', '私は果物を食べるのが好きです。'),
(14, 'Nhà tôi ở bên trái trường học.', 'My house is on the left side of the school.', '私の家は学校の左側にあります。');

INSERT INTO Synonyms (word_id, synonym_word_id) VALUES
(1, 4),  -- đông ~ đẹp (đông vui ~ đẹp, nghĩa rộng)
(5, 9),  -- ăn ~ nhanh (ăn nhanh)
(7, 4),  -- cao ~ đẹp (cao đẹp)
(3, 8),  -- mẹ ~ bạn (nghĩa gần gũi, gần bạn)
(10, 5); -- trái ~ ăn (trái cây, ăn trái)