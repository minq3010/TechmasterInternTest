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

CALL GetWordDetails('chạy');