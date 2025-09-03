
import type { VocabularyWord } from "@/lib/types";
import { hiragana, katakana } from "@/data/kana";
import { n5Words } from "@/data/n5-words";
import { n4Words } from "@/data/n4-words";
import { n3Words } from "@/data/n3-words";
import { n2Words } from "@/data/n2-words";
import { n1Words } from "@/data/n1-words";

export const allWords: VocabularyWord[] = [
  // Deck 1: Greetings & Common Phrases
  { id: "1-1", japanese: "今日は", reading: "こんにちは", meaning: "Hello / Good afternoon", deckId: "1" },
  { id: "1-2", japanese: "お早うございます", reading: "おはようございます", meaning: "Good morning", deckId: "1" },
  { id: "1-3", japanese: "今晩は", reading: "こんばんは", meaning: "Good evening", deckId: "1" },
  { id: "1-4", japanese: "有り難う", reading: "ありがとう", meaning: "Thank you", deckId: "1" },
  { id: "1-5", japanese: "済みません", reading: "すみません", meaning: "Excuse me / I'm sorry", deckId: "1" },
  { id: "1-6", japanese: "さようなら", reading: "さようなら", meaning: "Goodbye", deckId: "1" },
  { id: "1-7", japanese: "じゃあね", reading: "じゃあね", meaning: "See you later (casual)", deckId: "1" },
  { id: "1-8", japanese: "お休みなさい", reading: "おやすみなさい", meaning: "Good night", deckId: "1" },
  { id: "1-9", japanese: "はい", reading: "はい", meaning: "Yes", deckId: "1" },
  { id: "1-10", japanese: "いいえ", reading: "いいえ", meaning: "No", deckId: "1" },
  { id: "1-11", japanese: "お願いします", reading: "おねがいします", meaning: "Please", deckId: "1" },
  { id: "1-12", japanese: "どう致しまして", reading: "どういたしまして", meaning: "You're welcome", deckId: "1" },
  { id: "1-13", japanese: "初めまして", reading: "はじめまして", meaning: "Nice to meet you", deckId: "1" },
  { id: "1-14", japanese: "どうぞ宜しく", reading: "どうぞよろしく", meaning: "Pleased to meet you", deckId: "1" },
  { id: "1-15", japanese: "お元気ですか", reading: "おげんきですか", meaning: "How are you?", deckId: "1" },
  { id: "1-16", japanese: "元気です", reading: "げんきです", meaning: "I'm fine", deckId: "1" },
  { id: "1-17", japanese: "ごめんなさい", reading: "ごめんなさい", meaning: "I'm sorry (more personal)", deckId: "1" },
  { id: "1-18", japanese: "行ってきます", reading: "いってきます", meaning: "I'm leaving", deckId: "1" },
  { id: "1-19", japanese: "行ってらっしゃい", reading: "いってらっしゃい", meaning: "Take care / See you (to someone leaving)", deckId: "1" },
  { id: "1-20", japanese: "只今", reading: "ただいま", meaning: "I'm home", deckId: "1" },
  { id: "1-21", japanese: "お帰りなさい", reading: "おかえりなさい", meaning: "Welcome home", deckId: "1" },
  { id: "1-22", japanese: "お名前は何ですか", reading: "おなまえはなんですか", meaning: "What is your name?", deckId: "1" },

  // Deck 2: Food
  { id: "2-1", japanese: "食べる", reading: "たべる", meaning: "To eat", deckId: "2" },
  { id: "2-2", japanese: "飲む", reading: "のむ", meaning: "To drink", deckId: "2" },
  { id: "2-3", japanese: "寿司", reading: "すし", meaning: "Sushi", deckId: "2" },
  { id: "2-4", japanese: "ラーメン", reading: "らーめん", meaning: "Ramen", deckId: "2" },
  { id: "2-5", japanese: "天ぷら", reading: "てんぷら", meaning: "Tempura", deckId: "2" },
  { id: "2-6", japanese: "ご飯", reading: "ごはん", meaning: "Rice / Meal", deckId: "2" },
  { id: "2-7", japanese: "水", reading: "みず", meaning: "Water", deckId: "2" },
  { id: "2-8", japanese: "お茶", reading: "おちゃ", meaning: "Tea", deckId: "2" },
  { id: "2-9", japanese: "魚", reading: "さかな", meaning: "Fish", deckId: "2" },
  { id: "2-10", japanese: "肉", reading: "にく", meaning: "Meat", deckId: "2" },
  { id: "2-11", japanese: "野菜", reading: "やさい", meaning: "Vegetable", deckId: "2" },
  { id: "2-12", japanese: "果物", reading: "くだもの", meaning: "Fruit", deckId: "2" },
  { id: "2-13", japanese: "レストラン", reading: "れすとらん", meaning: "Restaurant", deckId: "2" },
  { id: "2-14", japanese: "美味しい", reading: "おいしい", meaning: "Delicious", deckId: "2" },
  { id: "2-15", japanese: "頂きます", reading: "いただきます", meaning: "Let's eat (said before meal)", deckId: "2" },
  { id: "2-16", japanese: "ご馳走様でした", reading: "ごちそうさまでした", meaning: "Thanks for the meal", deckId: "2" },
  { id: "2-17", japanese: "メニュー", reading: "めにゅー", meaning: "Menu", deckId: "2" },
  { id: "2-18", japanese: "注文", reading: "ちゅうもん", meaning: "Order", deckId: "2" },
  { id: "2-19", japanese: "会計", reading: "かいけい", meaning: "Check / Bill", deckId: "2" },
  { id: "2-20", japanese: "朝ご飯", reading: "あさごはん", meaning: "Breakfast", deckId: "2" },
  { id: "2-21", japanese: "昼ご飯", reading: "ひるごはん", meaning: "Lunch", deckId: "2" },
  { id: "2-22", japanese: "晩ご飯", reading: "ばんごはん", meaning: "Dinner", deckId: "2" },
  { id: "2-23", japanese: "アレルギー", reading: "あれるぎい", meaning: "Allergy", deckId: "2" },
  { id: "2-24", japanese: "辛い", reading: "からい", meaning: "Spicy", deckId: "2" },
  { id: "2-25", japanese: "甘い", reading: "あまい", meaning: "Sweet", deckId: "2" },


  // Deck 3: Travel
  { id: "3-1", japanese: "旅行", reading: "りょこう", meaning: "Travel / Trip", deckId: "3" },
  { id: "3-2", japanese: "空港", reading: "くうこう", meaning: "Airport", deckId: "3" },
  { id: "3-3", japanese: "駅", reading: "えき", meaning: "Station", deckId: "3" },
  { id: "3-4", japanese: "電車", reading: "でんしゃ", meaning: "Train", deckId: "3" },
  { id: "3-5", japanese: "地下鉄", reading: "ちかてつ", meaning: "Subway", deckId: "3" },
  { id: "3-6", japanese: "バス", reading: "ばす", meaning: "Bus", deckId: "3" },
  { id: "3-7", japanese: "タクシー", reading: "たくしい", meaning: "Taxi", deckId: "3" },
  { id: "3-8", japanese: "ホテル", reading: "ほてる", meaning: "Hotel", deckId: "3" },
  { id: "3-9", japanese: "予約", reading: "よやく", meaning: "Reservation", deckId: "3" },
  { id: "3-10", japanese: "地図", reading: "ちず", meaning: "Map", deckId: "3" },
  { id: "3-11", japanese: "切符", reading: "きっぷ", meaning: "Ticket", deckId: "3" },
  { id: "3-12", japanese: "パスポート", reading: "ぱすぽーと", meaning: "Passport", deckId: "3" },
  { id: "3-13", japanese: "荷物", reading: "にもつ", meaning: "Luggage", deckId: "3" },
  { id: "3-14", japanese: "何処ですか", reading: "どこですか", meaning: "Where is it?", deckId: "3" },
  { id: "3-15", japanese: "いくらですか", reading: "いくらですか", meaning: "How much is it?", deckId: "3" },
  { id: "3-16", japanese: "右", reading: "みぎ", meaning: "Right", deckId: "3" },
  { id: "3-17", japanese: "左", reading: "ひだり", meaning: "Left", deckId: "3" },
  { id: "3-18", japanese: "真っ直ぐ", reading: "まっすぐ", meaning: "Straight ahead", deckId: "3" },
  { id: "3-19", japanese: "観光", reading: "かんこう", meaning: "Sightseeing", deckId: "3" },
  { id: "3-20", japanese: "お土産", reading: "おみやげ", meaning: "Souvenir", deckId: "3" },
  { id: "3-21", japanese: "写真", reading: "しゃしん", meaning: "Photograph", deckId: "3" },
  { id: "3-22", japanese: "出口", reading: "でぐち", meaning: "Exit", deckId: "3" },
  { id: "3-23", japanese: "入口", reading: "いりぐち", meaning: "Entrance", deckId: "3" },
  { id: "3-24", japanese: "トイレ", reading: "といれ", meaning: "Toilet / Restroom", deckId: "3" },
  { id: "3-25", japanese: "飛行機", reading: "ひこうき", meaning: "Airplane", deckId: "3" },

  // Deck: JLPT N5 (Imported)
  ...n5Words,

  // Deck: JLPT N4
  ...n4Words,

  // Deck: JLPT N3
  ...n3Words,

  // Deck: JLPT N2
  ...n2Words,

  // Deck: JLPT N1
  ...n1Words,

  // Deck: Hiragana
  ...hiragana.map((kana, i) => ({ id: `h-${i}`, japanese: kana.j, reading: kana.j, meaning: kana.r, deckId: 'hiragana' })),

  // Deck: Katakana
   ...katakana.map((kana, i) => ({ id: `k-${i}`, japanese: kana.j, reading: kana.h, meaning: kana.r, deckId: 'katakana' })),
];
