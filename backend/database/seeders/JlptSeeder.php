<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Word;
use App\Models\Deck;
use Illuminate\Support\Str;

class JlptSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create JLPT decks
        $decks = [
            [
                'name' => 'JLPT N5 Vocabulary',
                'slug' => 'jlpt-n5',
                'description' => 'Essential vocabulary for JLPT N5 level',
                'jlpt_level' => 'N5',
                'category' => 'jlpt',
            ],
            [
                'name' => 'JLPT N4 Vocabulary',
                'slug' => 'jlpt-n4',
                'description' => 'Essential vocabulary for JLPT N4 level',
                'jlpt_level' => 'N4',
                'category' => 'jlpt',
            ],
            [
                'name' => 'JLPT N3 Vocabulary',
                'slug' => 'jlpt-n3',
                'description' => 'Essential vocabulary for JLPT N3 level',
                'jlpt_level' => 'N3',
                'category' => 'jlpt',
            ],
        ];

        foreach ($decks as $deckData) {
            Deck::create($deckData);
        }

        // Sample N5 words (you can expand this with your actual data)
        $n5Words = [
            [
                'japanese' => 'こんにちは',
                'reading' => 'konnichiwa',
                'english' => 'hello/good afternoon',
                'jlpt_level' => 'N5',
                'part_of_speech' => 'expression',
            ],
            [
                'japanese' => 'ありがとう',
                'reading' => 'arigatou',
                'english' => 'thank you',
                'jlpt_level' => 'N5',
                'part_of_speech' => 'expression',
            ],
            [
                'japanese' => '水',
                'reading' => 'mizu',
                'english' => 'water',
                'jlpt_level' => 'N5',
                'part_of_speech' => 'noun',
            ],
            [
                'japanese' => '食べる',
                'reading' => 'taberu',
                'english' => 'to eat',
                'jlpt_level' => 'N5',
                'part_of_speech' => 'verb',
            ],
            [
                'japanese' => '大きい',
                'reading' => 'ookii',
                'english' => 'big/large',
                'jlpt_level' => 'N5',
                'part_of_speech' => 'adjective',
            ],
        ];

        // Sample N4 words
        $n4Words = [
            [
                'japanese' => '勉強',
                'reading' => 'benkyou',
                'english' => 'study',
                'jlpt_level' => 'N4',
                'part_of_speech' => 'noun',
            ],
            [
                'japanese' => '準備',
                'reading' => 'junbi',
                'english' => 'preparation',
                'jlpt_level' => 'N4',
                'part_of_speech' => 'noun',
            ],
        ];

        // Create words
        $allWords = array_merge($n5Words, $n4Words);
        
        foreach ($allWords as $wordData) {
            Word::create($wordData);
        }

        // Associate words with decks
        $n5Deck = Deck::where('slug', 'jlpt-n5')->first();
        $n4Deck = Deck::where('slug', 'jlpt-n4')->first();

        // Add N5 words to N5 deck
        $n5Words = Word::where('jlpt_level', 'N5')->get();
        foreach ($n5Words as $index => $word) {
            $n5Deck->words()->attach($word->id, ['order' => $index]);
        }

        // Add N4 words to N4 deck
        $n4Words = Word::where('jlpt_level', 'N4')->get();
        foreach ($n4Words as $index => $word) {
            $n4Deck->words()->attach($word->id, ['order' => $index]);
        }

        // Update word counts
        $n5Deck->updateWordCount();
        $n4Deck->updateWordCount();

        $this->command->info('JLPT words and decks seeded successfully!');
    }
} 