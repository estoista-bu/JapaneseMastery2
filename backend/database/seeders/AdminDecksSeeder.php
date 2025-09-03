<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Deck;
use App\Models\Word;

class AdminDecksSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin decks
        $adminDecks = [
            [
                'name' => 'Greetings',
                'slug' => 'greetings',
                'description' => 'Essential phrases for everyday interactions.',
                'category' => 'admin',
                'is_active' => true,
                'word_count' => 0,
            ],
            [
                'name' => 'Food',
                'slug' => 'food',
                'description' => 'Vocabulary for ordering at restaurants and talking about food.',
                'category' => 'admin',
                'is_active' => true,
                'word_count' => 0,
            ],
            [
                'name' => 'Travel',
                'slug' => 'travel',
                'description' => 'Words and phrases for navigating Japan.',
                'category' => 'admin',
                'is_active' => true,
                'word_count' => 0,
            ],
        ];

        foreach ($adminDecks as $deckData) {
            Deck::updateOrCreate(
                ['slug' => $deckData['slug']],
                $deckData
            );
        }

        // Greetings words
        $greetingsWords = [
            ['japanese' => '今日は', 'reading' => 'こんにちは', 'english' => 'Hello / Good afternoon'],
            ['japanese' => 'お早うございます', 'reading' => 'おはようございます', 'english' => 'Good morning'],
            ['japanese' => '今晩は', 'reading' => 'こんばんは', 'english' => 'Good evening'],
            ['japanese' => '有り難う', 'reading' => 'ありがとう', 'english' => 'Thank you'],
            ['japanese' => '済みません', 'reading' => 'すみません', 'english' => 'Excuse me / I\'m sorry'],
            ['japanese' => 'さようなら', 'reading' => 'さようなら', 'english' => 'Goodbye'],
            ['japanese' => 'じゃあね', 'reading' => 'じゃあね', 'english' => 'See you later (casual)'],
            ['japanese' => 'お休みなさい', 'reading' => 'おやすみなさい', 'english' => 'Good night'],
            ['japanese' => 'はい', 'reading' => 'はい', 'english' => 'Yes'],
            ['japanese' => 'いいえ', 'reading' => 'いいえ', 'english' => 'No'],
            ['japanese' => 'お願いします', 'reading' => 'おねがいします', 'english' => 'Please'],
            ['japanese' => 'どう致しまして', 'reading' => 'どういたしまして', 'english' => 'You\'re welcome'],
            ['japanese' => '初めまして', 'reading' => 'はじめまして', 'english' => 'Nice to meet you'],
            ['japanese' => 'どうぞ宜しく', 'reading' => 'どうぞよろしく', 'english' => 'Pleased to meet you'],
            ['japanese' => 'お元気ですか', 'reading' => 'おげんきですか', 'english' => 'How are you?'],
            ['japanese' => '元気です', 'reading' => 'げんきです', 'english' => 'I\'m fine'],
            ['japanese' => 'ごめんなさい', 'reading' => 'ごめんなさい', 'english' => 'I\'m sorry (more personal)'],
            ['japanese' => '行ってきます', 'reading' => 'いってきます', 'english' => 'I\'m leaving'],
            ['japanese' => '行ってらっしゃい', 'reading' => 'いってらっしゃい', 'english' => 'Take care / See you (to someone leaving)'],
            ['japanese' => '只今', 'reading' => 'ただいま', 'english' => 'I\'m home'],
            ['japanese' => 'お帰りなさい', 'reading' => 'おかえりなさい', 'english' => 'Welcome home'],
            ['japanese' => 'お名前は何ですか', 'reading' => 'おなまえはなんですか', 'english' => 'What is your name?'],
        ];

        // Food words
        $foodWords = [
            ['japanese' => '食べる', 'reading' => 'たべる', 'english' => 'To eat'],
            ['japanese' => '飲む', 'reading' => 'のむ', 'english' => 'To drink'],
            ['japanese' => '寿司', 'reading' => 'すし', 'english' => 'Sushi'],
            ['japanese' => 'ラーメン', 'reading' => 'らーめん', 'english' => 'Ramen'],
            ['japanese' => '天ぷら', 'reading' => 'てんぷら', 'english' => 'Tempura'],
            ['japanese' => 'ご飯', 'reading' => 'ごはん', 'english' => 'Rice / Meal'],
            ['japanese' => '水', 'reading' => 'みず', 'english' => 'Water'],
            ['japanese' => 'お茶', 'reading' => 'おちゃ', 'english' => 'Tea'],
            ['japanese' => '魚', 'reading' => 'さかな', 'english' => 'Fish'],
            ['japanese' => '肉', 'reading' => 'にく', 'english' => 'Meat'],
            ['japanese' => '野菜', 'reading' => 'やさい', 'english' => 'Vegetable'],
            ['japanese' => '果物', 'reading' => 'くだもの', 'english' => 'Fruit'],
            ['japanese' => 'レストラン', 'reading' => 'れすとらん', 'english' => 'Restaurant'],
            ['japanese' => '美味しい', 'reading' => 'おいしい', 'english' => 'Delicious'],
            ['japanese' => '頂きます', 'reading' => 'いただきます', 'english' => 'Let\'s eat (said before meal)'],
            ['japanese' => 'ご馳走様でした', 'reading' => 'ごちそうさまでした', 'english' => 'Thanks for the meal'],
            ['japanese' => 'メニュー', 'reading' => 'めにゅー', 'english' => 'Menu'],
            ['japanese' => '注文', 'reading' => 'ちゅうもん', 'english' => 'Order'],
            ['japanese' => '会計', 'reading' => 'かいけい', 'english' => 'Check / Bill'],
            ['japanese' => '朝ご飯', 'reading' => 'あさごはん', 'english' => 'Breakfast'],
            ['japanese' => '昼ご飯', 'reading' => 'ひるごはん', 'english' => 'Lunch'],
            ['japanese' => '晩ご飯', 'reading' => 'ばんごはん', 'english' => 'Dinner'],
            ['japanese' => 'アレルギー', 'reading' => 'あれるぎい', 'english' => 'Allergy'],
            ['japanese' => '辛い', 'reading' => 'からい', 'english' => 'Spicy'],
            ['japanese' => '甘い', 'reading' => 'あまい', 'english' => 'Sweet'],
        ];

        // Travel words
        $travelWords = [
            ['japanese' => '旅行', 'reading' => 'りょこう', 'english' => 'Travel / Trip'],
            ['japanese' => '空港', 'reading' => 'くうこう', 'english' => 'Airport'],
            ['japanese' => '駅', 'reading' => 'えき', 'english' => 'Station'],
            ['japanese' => '電車', 'reading' => 'でんしゃ', 'english' => 'Train'],
            ['japanese' => '地下鉄', 'reading' => 'ちかてつ', 'english' => 'Subway'],
            ['japanese' => 'バス', 'reading' => 'ばす', 'english' => 'Bus'],
            ['japanese' => 'タクシー', 'reading' => 'たくしい', 'english' => 'Taxi'],
            ['japanese' => 'ホテル', 'reading' => 'ほてる', 'english' => 'Hotel'],
            ['japanese' => '予約', 'reading' => 'よやく', 'english' => 'Reservation'],
            ['japanese' => '地図', 'reading' => 'ちず', 'english' => 'Map'],
            ['japanese' => '切符', 'reading' => 'きっぷ', 'english' => 'Ticket'],
            ['japanese' => 'パスポート', 'reading' => 'ぱすぽーと', 'english' => 'Passport'],
            ['japanese' => '荷物', 'reading' => 'にもつ', 'english' => 'Luggage'],
            ['japanese' => '何処ですか', 'reading' => 'どこですか', 'english' => 'Where is it?'],
            ['japanese' => 'いくらですか', 'reading' => 'いくらですか', 'english' => 'How much is it?'],
            ['japanese' => '右', 'reading' => 'みぎ', 'english' => 'Right'],
            ['japanese' => '左', 'reading' => 'ひだり', 'english' => 'Left'],
            ['japanese' => '真っ直ぐ', 'reading' => 'まっすぐ', 'english' => 'Straight ahead'],
            ['japanese' => '観光', 'reading' => 'かんこう', 'english' => 'Sightseeing'],
            ['japanese' => 'お土産', 'reading' => 'おみやげ', 'english' => 'Souvenir'],
            ['japanese' => '写真', 'reading' => 'しゃしん', 'english' => 'Photograph'],
            ['japanese' => '出口', 'reading' => 'でぐち', 'english' => 'Exit'],
            ['japanese' => '入口', 'reading' => 'いりぐち', 'english' => 'Entrance'],
            ['japanese' => 'トイレ', 'reading' => 'といれ', 'english' => 'Toilet / Restroom'],
            ['japanese' => '飛行機', 'reading' => 'ひこうき', 'english' => 'Airplane'],
        ];

        // Add words to database and link to decks
        $this->addWordsToDeck('greetings', $greetingsWords);
        $this->addWordsToDeck('food', $foodWords);
        $this->addWordsToDeck('travel', $travelWords);

        $this->command->info('Admin decks and words seeded successfully!');
    }

    private function addWordsToDeck(string $deckSlug, array $words): void
    {
        $deck = Deck::where('slug', $deckSlug)->first();
        if (!$deck) {
            $this->command->error("Deck {$deckSlug} not found!");
            return;
        }

        $wordCount = 0;
        foreach ($words as $wordData) {
            // Use updateOrCreate to handle existing words
            $word = Word::updateOrCreate(
                ['japanese' => $wordData['japanese']], // Use japanese as unique key
                [
                    'reading' => $wordData['reading'],
                    'english' => $wordData['english'],
                    'jlpt_level' => null, // These are basic words, not JLPT specific
                ]
            );

            // Link word to deck (this won't create duplicates due to unique constraint)
            $deck->words()->syncWithoutDetaching([$word->id]);
            $wordCount++;
        }

        // Update deck word count
        $deck->updateWordCount();
        $this->command->info("Added {$wordCount} words to {$deck->name} deck");
    }
} 