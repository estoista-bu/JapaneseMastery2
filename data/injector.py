import json
import mysql.connector
from datetime import datetime

# ---- CONFIG ----
DB_CONFIG = {
    "host": "localhost",     # change if needed
    "user": "root",          # change your MySQL user
    "password": "Slitherin1",  # change your MySQL password
    "database": "japanese_mastery"
}

TABLE_NAME = "words"
JSON_FILE = "n4-words.json"

# ---- MAIN ----
def main():
    with open(JSON_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()

    query = f"""
    INSERT INTO {TABLE_NAME}
    (japanese, reading, english, jlpt_level, part_of_speech, example_sentence, created_at, updated_at)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    ON DUPLICATE KEY UPDATE
        jlpt_level = VALUES(jlpt_level),
        part_of_speech = VALUES(part_of_speech),
        example_sentence = VALUES(example_sentence),
        updated_at = VALUES(updated_at)
    """

    now = datetime.now()
    for entry in data:
        cursor.execute(query, (
            entry.get("japanese"),
            entry.get("reading"),
            entry.get("english"),
            entry.get("jlpt_level"),
            entry.get("part_of_speech"),
            entry.get("example_sentence"),
            now,
            now
        ))

    conn.commit()
    print(f"Inserted/Updated {cursor.rowcount} rows (last batch).")

    cursor.close()
    conn.close()

if __name__ == "__main__":
    main()