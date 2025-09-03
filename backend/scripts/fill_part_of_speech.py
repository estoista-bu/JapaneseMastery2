#!/usr/bin/env python3
"""
Script to backfill part_of_speech column in words table using fugashi
"""

import mysql.connector
import fugashi
import unidic_lite
import json
import sys
from typing import Optional

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'Slitherin1',
    'database': 'japanese_mastery'
}

def get_part_of_speech(tagger: fugashi.Tagger, text: str) -> Optional[str]:
    """Extract part of speech from Japanese text using fugashi"""
    try:
        words = tagger(text)
        pos_list = []
        
        for word in words:
            if word.feature.pos1 and word.feature.pos1 != '*':
                pos = word.feature.pos1.lower()
                # Map Japanese POS to English equivalents
                pos_mapping = {
                    '名詞': 'noun',
                    '動詞': 'verb', 
                    '形容詞': 'adjective',
                    '副詞': 'adverb',
                    '助詞': 'particle',
                    '助動詞': 'auxiliary',
                    '接続詞': 'conjunction',
                    '接頭詞': 'prefix',
                    '接尾辞': 'suffix',
                    '記号': 'symbol',
                    'その他': 'other',
                    '連体詞': 'adjective',  # 連体詞 = attributive adjective
                    '代名詞': 'pronoun',     # 代名詞 = pronoun
                    '形状詞': 'adjective',   # 形状詞 = shape adjective
                    '感動詞': 'interjection', # 感動詞 = interjection
                    '補助記号': 'symbol',    # 補助記号 = auxiliary symbol
                    'フィラー': 'filler',     # フィラー = filler word
                    '未知語': 'unknown'       # 未知語 = unknown word
                }
                pos_list.append(pos_mapping.get(pos, pos))
        
        # Return the first valid POS, or None if none found
        return pos_list[0] if pos_list else None
        
    except Exception as e:
        print(f"Error processing text '{text}': {e}")
        return None

def main():
    print("Starting part_of_speech backfill...")
    
    # Initialize fugashi
    try:
        tagger = fugashi.Tagger()
        print("✅ Fugashi initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize Fugashi: {e}")
        print("Please install dependencies: pip install fugashi unidic-lite")
        sys.exit(1)
    
    # Connect to database
    try:
        db = mysql.connector.connect(**DB_CONFIG)
        cursor = db.cursor()
        print("✅ Database connected successfully")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        sys.exit(1)
    
    # Get words without part_of_speech (including NULL strings)
    cursor.execute("SELECT COUNT(*) FROM words WHERE part_of_speech IS NULL OR part_of_speech = '' OR part_of_speech = 'NULL'")
    total_words = cursor.fetchone()[0]
    print(f"Found {total_words} words without part_of_speech")
    
    if total_words == 0:
        print("✅ All words already have part_of_speech filled")
        return
    
    # Process words in batches
    batch_size = 100
    processed = 0
    updated = 0
    
    cursor.execute("SELECT id, japanese FROM words WHERE part_of_speech IS NULL OR part_of_speech = '' OR part_of_speech = 'NULL'")
    
    for word_id, japanese in cursor.fetchall():
        processed += 1
        
        # Get part of speech
        pos = get_part_of_speech(tagger, japanese)
        
        if pos:
            # Update database
            cursor.execute(
                "UPDATE words SET part_of_speech = %s WHERE id = %s",
                (pos, word_id)
            )
            updated += 1
            
            if processed % 100 == 0:
                print(f"Processed: {processed}/{total_words}, Updated: {updated}")
                db.commit()  # Commit every 100 records
    
    # Final commit
    db.commit()
    
    print(f"✅ Completed! Processed: {processed}, Updated: {updated}")
    
    # Show summary
    cursor.execute("SELECT part_of_speech, COUNT(*) FROM words GROUP BY part_of_speech ORDER BY COUNT(*) DESC")
    print("\nPart of speech distribution:")
    for pos, count in cursor.fetchall():
        print(f"  {pos or 'NULL'}: {count}")
    
    cursor.close()
    db.close()

if __name__ == "__main__":
    main()
