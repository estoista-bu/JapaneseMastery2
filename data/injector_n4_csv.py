import csv
import mysql.connector
from datetime import datetime

# ---- CONFIG ----
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "Slitherin1",
    "database": "japanese_mastery",
    "charset": "utf8mb4"
}

CSV_FILE = "N5.csv"

# ---- MAIN ----
def main():
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()

    skipped_incomplete = 0
    skipped_duplicates = 0
    inserted_count = 0

    with open(CSV_FILE, "r", encoding="utf-8-sig") as f:  # utf-8-sig handles BOM from Excel
        reader = csv.DictReader(f)
        
        # Normalize headers: remove spaces and lowercase
        reader.fieldnames = [h.strip().lower() for h in reader.fieldnames]
        print(f"Detected columns: {reader.fieldnames}")

        for row in reader:
            # Clean up keys to match normalized headers
            row = {k.strip().lower(): v.strip() for k, v in row.items() if v is not None}

            japanese = row.get("japanese") or row.get("reading")
            reading = row.get("reading") or japanese
            english = row.get("english") or ""

            # Optional fields
            jlpt_level = "N5"
            part_of_speech = row.get("part_of_speech") or None
            example_sentence = row.get("example_sentence") or None

            # Skip if mandatory fields are missing
            if not japanese or not reading or not english:
                skipped_incomplete += 1
                print(f"Skipping incomplete row: {row}")
                continue

            # Check for duplicates
            cursor.execute(
                "SELECT id FROM words WHERE japanese = %s AND reading = %s AND english = %s",
                (japanese, reading, english)
            )
            if cursor.fetchone():
                skipped_duplicates += 1
                print(f"Skipping duplicate: {japanese} / {reading} / {english}")
                continue

            # Insert word
            cursor.execute("""
                INSERT INTO words
                (japanese, reading, english, jlpt_level, part_of_speech, example_sentence, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, NOW(), NOW())
            """, (japanese, reading, english, jlpt_level, part_of_speech, example_sentence))

            inserted_count += 1
            print(f"Inserted: {japanese} / {reading} / {english}")

    conn.commit()

    print("All done!")
    print(f"Inserted: {inserted_count}")
    print(f"Skipped incomplete: {skipped_incomplete}")
    print(f"Skipped duplicates: {skipped_duplicates}")

    cursor.close()
    conn.close()

if __name__ == "__main__":
    main()
