
import type { Deck } from "@/lib/types";

export const allDecks: Deck[] = [
  { id: "1", name: "Greetings", description: "Essential phrases for everyday interactions.", category: "user" },
  { id: "2", name: "Food", description: "Vocabulary for ordering at restaurants and talking about food.", category: "user" },
  { id: "3", name: "Travel", description: "Words and phrases for navigating Japan.", category: "user" },
  { id: "jlpt-n5", name: "JLPT N5 Vocabulary", description: "Core vocabulary for the N5 level.", category: "jlpt" },
  { id: "jlpt-n4", name: "JLPT N4 Vocabulary", description: "Essential vocabulary for the N4 level.", category: "jlpt" },
  { id: "jlpt-n3", name: "JLPT N3 Vocabulary", description: "A comprehensive list of JLPT N3 vocabulary words.", category: "jlpt" },
  { id: "jlpt-n2", name: "JLPT N2 Vocabulary", description: "A comprehensive list of JLPT N2 vocabulary words.", category: "jlpt" },
  { id: "jlpt-n1", name: "JLPT N1 Vocabulary", description: "A comprehensive list of JLPT N1 vocabulary words.", category: "jlpt" },
  { id: "hiragana", name: "Hiragana", description: "The basic Japanese phonetic script.", category: "kana" },
  { id: "katakana", name: "Katakana", description: "Phonetic script for foreign words.", category: "kana" },
];
