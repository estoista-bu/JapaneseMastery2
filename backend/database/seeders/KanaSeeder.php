<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Kana;

class KanaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $hiragana = [
            // Basic hiragana
            ['character' => 'あ', 'romaji' => 'a', 'type' => 'hiragana', 'category' => 'basic', 'order' => 1],
            ['character' => 'い', 'romaji' => 'i', 'type' => 'hiragana', 'category' => 'basic', 'order' => 2],
            ['character' => 'う', 'romaji' => 'u', 'type' => 'hiragana', 'category' => 'basic', 'order' => 3],
            ['character' => 'え', 'romaji' => 'e', 'type' => 'hiragana', 'category' => 'basic', 'order' => 4],
            ['character' => 'お', 'romaji' => 'o', 'type' => 'hiragana', 'category' => 'basic', 'order' => 5],
            ['character' => 'か', 'romaji' => 'ka', 'type' => 'hiragana', 'category' => 'basic', 'order' => 6],
            ['character' => 'き', 'romaji' => 'ki', 'type' => 'hiragana', 'category' => 'basic', 'order' => 7],
            ['character' => 'く', 'romaji' => 'ku', 'type' => 'hiragana', 'category' => 'basic', 'order' => 8],
            ['character' => 'け', 'romaji' => 'ke', 'type' => 'hiragana', 'category' => 'basic', 'order' => 9],
            ['character' => 'こ', 'romaji' => 'ko', 'type' => 'hiragana', 'category' => 'basic', 'order' => 10],
            ['character' => 'さ', 'romaji' => 'sa', 'type' => 'hiragana', 'category' => 'basic', 'order' => 11],
            ['character' => 'し', 'romaji' => 'shi', 'type' => 'hiragana', 'category' => 'basic', 'order' => 12],
            ['character' => 'す', 'romaji' => 'su', 'type' => 'hiragana', 'category' => 'basic', 'order' => 13],
            ['character' => 'せ', 'romaji' => 'se', 'type' => 'hiragana', 'category' => 'basic', 'order' => 14],
            ['character' => 'そ', 'romaji' => 'so', 'type' => 'hiragana', 'category' => 'basic', 'order' => 15],
            ['character' => 'た', 'romaji' => 'ta', 'type' => 'hiragana', 'category' => 'basic', 'order' => 16],
            ['character' => 'ち', 'romaji' => 'chi', 'type' => 'hiragana', 'category' => 'basic', 'order' => 17],
            ['character' => 'つ', 'romaji' => 'tsu', 'type' => 'hiragana', 'category' => 'basic', 'order' => 18],
            ['character' => 'て', 'romaji' => 'te', 'type' => 'hiragana', 'category' => 'basic', 'order' => 19],
            ['character' => 'と', 'romaji' => 'to', 'type' => 'hiragana', 'category' => 'basic', 'order' => 20],
            ['character' => 'な', 'romaji' => 'na', 'type' => 'hiragana', 'category' => 'basic', 'order' => 21],
            ['character' => 'に', 'romaji' => 'ni', 'type' => 'hiragana', 'category' => 'basic', 'order' => 22],
            ['character' => 'ぬ', 'romaji' => 'nu', 'type' => 'hiragana', 'category' => 'basic', 'order' => 23],
            ['character' => 'ね', 'romaji' => 'ne', 'type' => 'hiragana', 'category' => 'basic', 'order' => 24],
            ['character' => 'の', 'romaji' => 'no', 'type' => 'hiragana', 'category' => 'basic', 'order' => 25],
            ['character' => 'は', 'romaji' => 'ha', 'type' => 'hiragana', 'category' => 'basic', 'order' => 26],
            ['character' => 'ひ', 'romaji' => 'hi', 'type' => 'hiragana', 'category' => 'basic', 'order' => 27],
            ['character' => 'ふ', 'romaji' => 'fu', 'type' => 'hiragana', 'category' => 'basic', 'order' => 28],
            ['character' => 'へ', 'romaji' => 'he', 'type' => 'hiragana', 'category' => 'basic', 'order' => 29],
            ['character' => 'ほ', 'romaji' => 'ho', 'type' => 'hiragana', 'category' => 'basic', 'order' => 30],
            ['character' => 'ま', 'romaji' => 'ma', 'type' => 'hiragana', 'category' => 'basic', 'order' => 31],
            ['character' => 'み', 'romaji' => 'mi', 'type' => 'hiragana', 'category' => 'basic', 'order' => 32],
            ['character' => 'む', 'romaji' => 'mu', 'type' => 'hiragana', 'category' => 'basic', 'order' => 33],
            ['character' => 'め', 'romaji' => 'me', 'type' => 'hiragana', 'category' => 'basic', 'order' => 34],
            ['character' => 'も', 'romaji' => 'mo', 'type' => 'hiragana', 'category' => 'basic', 'order' => 35],
            ['character' => 'や', 'romaji' => 'ya', 'type' => 'hiragana', 'category' => 'basic', 'order' => 36],
            ['character' => 'ゆ', 'romaji' => 'yu', 'type' => 'hiragana', 'category' => 'basic', 'order' => 37],
            ['character' => 'よ', 'romaji' => 'yo', 'type' => 'hiragana', 'category' => 'basic', 'order' => 38],
            ['character' => 'ら', 'romaji' => 'ra', 'type' => 'hiragana', 'category' => 'basic', 'order' => 39],
            ['character' => 'り', 'romaji' => 'ri', 'type' => 'hiragana', 'category' => 'basic', 'order' => 40],
            ['character' => 'る', 'romaji' => 'ru', 'type' => 'hiragana', 'category' => 'basic', 'order' => 41],
            ['character' => 'れ', 'romaji' => 're', 'type' => 'hiragana', 'category' => 'basic', 'order' => 42],
            ['character' => 'ろ', 'romaji' => 'ro', 'type' => 'hiragana', 'category' => 'basic', 'order' => 43],
            ['character' => 'わ', 'romaji' => 'wa', 'type' => 'hiragana', 'category' => 'basic', 'order' => 44],
            ['character' => 'を', 'romaji' => 'wo', 'type' => 'hiragana', 'category' => 'basic', 'order' => 45],
            ['character' => 'ん', 'romaji' => 'n', 'type' => 'hiragana', 'category' => 'basic', 'order' => 46],

            // Dakuten hiragana
            ['character' => 'が', 'romaji' => 'ga', 'type' => 'hiragana', 'category' => 'dakuten', 'order' => 47],
            ['character' => 'ぎ', 'romaji' => 'gi', 'type' => 'hiragana', 'category' => 'dakuten', 'order' => 48],
            ['character' => 'ぐ', 'romaji' => 'gu', 'type' => 'hiragana', 'category' => 'dakuten', 'order' => 49],
            ['character' => 'げ', 'romaji' => 'ge', 'type' => 'hiragana', 'category' => 'dakuten', 'order' => 50],
            ['character' => 'ご', 'romaji' => 'go', 'type' => 'hiragana', 'category' => 'dakuten', 'order' => 51],
            ['character' => 'ざ', 'romaji' => 'za', 'type' => 'hiragana', 'category' => 'dakuten', 'order' => 52],
            ['character' => 'じ', 'romaji' => 'ji', 'type' => 'hiragana', 'category' => 'dakuten', 'order' => 53],
            ['character' => 'ず', 'romaji' => 'zu', 'type' => 'hiragana', 'category' => 'dakuten', 'order' => 54],
            ['character' => 'ぜ', 'romaji' => 'ze', 'type' => 'hiragana', 'category' => 'dakuten', 'order' => 55],
            ['character' => 'ぞ', 'romaji' => 'zo', 'type' => 'hiragana', 'category' => 'dakuten', 'order' => 56],
            ['character' => 'だ', 'romaji' => 'da', 'type' => 'hiragana', 'category' => 'dakuten', 'order' => 57],
            ['character' => 'ぢ', 'romaji' => 'ji', 'type' => 'hiragana', 'category' => 'dakuten', 'order' => 58],
            ['character' => 'づ', 'romaji' => 'zu', 'type' => 'hiragana', 'category' => 'dakuten', 'order' => 59],
            ['character' => 'で', 'romaji' => 'de', 'type' => 'hiragana', 'category' => 'dakuten', 'order' => 60],
            ['character' => 'ど', 'romaji' => 'do', 'type' => 'hiragana', 'category' => 'dakuten', 'order' => 61],
            ['character' => 'ば', 'romaji' => 'ba', 'type' => 'hiragana', 'category' => 'dakuten', 'order' => 62],
            ['character' => 'び', 'romaji' => 'bi', 'type' => 'hiragana', 'category' => 'dakuten', 'order' => 63],
            ['character' => 'ぶ', 'romaji' => 'bu', 'type' => 'hiragana', 'category' => 'dakuten', 'order' => 64],
            ['character' => 'べ', 'romaji' => 'be', 'type' => 'hiragana', 'category' => 'dakuten', 'order' => 65],
            ['character' => 'ぼ', 'romaji' => 'bo', 'type' => 'hiragana', 'category' => 'dakuten', 'order' => 66],

            // Handakuten hiragana
            ['character' => 'ぱ', 'romaji' => 'pa', 'type' => 'hiragana', 'category' => 'handakuten', 'order' => 67],
            ['character' => 'ぴ', 'romaji' => 'pi', 'type' => 'hiragana', 'category' => 'handakuten', 'order' => 68],
            ['character' => 'ぷ', 'romaji' => 'pu', 'type' => 'hiragana', 'category' => 'handakuten', 'order' => 69],
            ['character' => 'ぺ', 'romaji' => 'pe', 'type' => 'hiragana', 'category' => 'handakuten', 'order' => 70],
            ['character' => 'ぽ', 'romaji' => 'po', 'type' => 'hiragana', 'category' => 'handakuten', 'order' => 71],

            // Small hiragana
            ['character' => 'ゃ', 'romaji' => 'ya', 'type' => 'hiragana', 'category' => 'small', 'order' => 72],
            ['character' => 'ゅ', 'romaji' => 'yu', 'type' => 'hiragana', 'category' => 'small', 'order' => 73],
            ['character' => 'ょ', 'romaji' => 'yo', 'type' => 'hiragana', 'category' => 'small', 'order' => 74],
            ['character' => 'っ', 'romaji' => 'tsu', 'type' => 'hiragana', 'category' => 'small', 'order' => 75],
        ];

        $katakana = [
            // Basic katakana
            ['character' => 'ア', 'romaji' => 'a', 'type' => 'katakana', 'category' => 'basic', 'order' => 76],
            ['character' => 'イ', 'romaji' => 'i', 'type' => 'katakana', 'category' => 'basic', 'order' => 77],
            ['character' => 'ウ', 'romaji' => 'u', 'type' => 'katakana', 'category' => 'basic', 'order' => 78],
            ['character' => 'エ', 'romaji' => 'e', 'type' => 'katakana', 'category' => 'basic', 'order' => 79],
            ['character' => 'オ', 'romaji' => 'o', 'type' => 'katakana', 'category' => 'basic', 'order' => 80],
            ['character' => 'カ', 'romaji' => 'ka', 'type' => 'katakana', 'category' => 'basic', 'order' => 81],
            ['character' => 'キ', 'romaji' => 'ki', 'type' => 'katakana', 'category' => 'basic', 'order' => 82],
            ['character' => 'ク', 'romaji' => 'ku', 'type' => 'katakana', 'category' => 'basic', 'order' => 83],
            ['character' => 'ケ', 'romaji' => 'ke', 'type' => 'katakana', 'category' => 'basic', 'order' => 84],
            ['character' => 'コ', 'romaji' => 'ko', 'type' => 'katakana', 'category' => 'basic', 'order' => 85],
            ['character' => 'サ', 'romaji' => 'sa', 'type' => 'katakana', 'category' => 'basic', 'order' => 86],
            ['character' => 'シ', 'romaji' => 'shi', 'type' => 'katakana', 'category' => 'basic', 'order' => 87],
            ['character' => 'ス', 'romaji' => 'su', 'type' => 'katakana', 'category' => 'basic', 'order' => 88],
            ['character' => 'セ', 'romaji' => 'se', 'type' => 'katakana', 'category' => 'basic', 'order' => 89],
            ['character' => 'ソ', 'romaji' => 'so', 'type' => 'katakana', 'category' => 'basic', 'order' => 90],
            ['character' => 'タ', 'romaji' => 'ta', 'type' => 'katakana', 'category' => 'basic', 'order' => 91],
            ['character' => 'チ', 'romaji' => 'chi', 'type' => 'katakana', 'category' => 'basic', 'order' => 92],
            ['character' => 'ツ', 'romaji' => 'tsu', 'type' => 'katakana', 'category' => 'basic', 'order' => 93],
            ['character' => 'テ', 'romaji' => 'te', 'type' => 'katakana', 'category' => 'basic', 'order' => 94],
            ['character' => 'ト', 'romaji' => 'to', 'type' => 'katakana', 'category' => 'basic', 'order' => 95],
            ['character' => 'ナ', 'romaji' => 'na', 'type' => 'katakana', 'category' => 'basic', 'order' => 96],
            ['character' => 'ニ', 'romaji' => 'ni', 'type' => 'katakana', 'category' => 'basic', 'order' => 97],
            ['character' => 'ヌ', 'romaji' => 'nu', 'type' => 'katakana', 'category' => 'basic', 'order' => 98],
            ['character' => 'ネ', 'romaji' => 'ne', 'type' => 'katakana', 'category' => 'basic', 'order' => 99],
            ['character' => 'ノ', 'romaji' => 'no', 'type' => 'katakana', 'category' => 'basic', 'order' => 100],
            ['character' => 'ハ', 'romaji' => 'ha', 'type' => 'katakana', 'category' => 'basic', 'order' => 101],
            ['character' => 'ヒ', 'romaji' => 'hi', 'type' => 'katakana', 'category' => 'basic', 'order' => 102],
            ['character' => 'フ', 'romaji' => 'fu', 'type' => 'katakana', 'category' => 'basic', 'order' => 103],
            ['character' => 'ヘ', 'romaji' => 'he', 'type' => 'katakana', 'category' => 'basic', 'order' => 104],
            ['character' => 'ホ', 'romaji' => 'ho', 'type' => 'katakana', 'category' => 'basic', 'order' => 105],
            ['character' => 'マ', 'romaji' => 'ma', 'type' => 'katakana', 'category' => 'basic', 'order' => 106],
            ['character' => 'ミ', 'romaji' => 'mi', 'type' => 'katakana', 'category' => 'basic', 'order' => 107],
            ['character' => 'ム', 'romaji' => 'mu', 'type' => 'katakana', 'category' => 'basic', 'order' => 108],
            ['character' => 'メ', 'romaji' => 'me', 'type' => 'katakana', 'category' => 'basic', 'order' => 109],
            ['character' => 'モ', 'romaji' => 'mo', 'type' => 'katakana', 'category' => 'basic', 'order' => 110],
            ['character' => 'ヤ', 'romaji' => 'ya', 'type' => 'katakana', 'category' => 'basic', 'order' => 111],
            ['character' => 'ユ', 'romaji' => 'yu', 'type' => 'katakana', 'category' => 'basic', 'order' => 112],
            ['character' => 'ヨ', 'romaji' => 'yo', 'type' => 'katakana', 'category' => 'basic', 'order' => 113],
            ['character' => 'ラ', 'romaji' => 'ra', 'type' => 'katakana', 'category' => 'basic', 'order' => 114],
            ['character' => 'リ', 'romaji' => 'ri', 'type' => 'katakana', 'category' => 'basic', 'order' => 115],
            ['character' => 'ル', 'romaji' => 'ru', 'type' => 'katakana', 'category' => 'basic', 'order' => 116],
            ['character' => 'レ', 'romaji' => 're', 'type' => 'katakana', 'category' => 'basic', 'order' => 117],
            ['character' => 'ロ', 'romaji' => 'ro', 'type' => 'katakana', 'category' => 'basic', 'order' => 118],
            ['character' => 'ワ', 'romaji' => 'wa', 'type' => 'katakana', 'category' => 'basic', 'order' => 119],
            ['character' => 'ヲ', 'romaji' => 'wo', 'type' => 'katakana', 'category' => 'basic', 'order' => 120],
            ['character' => 'ン', 'romaji' => 'n', 'type' => 'katakana', 'category' => 'basic', 'order' => 121],

            // Dakuten katakana
            ['character' => 'ガ', 'romaji' => 'ga', 'type' => 'katakana', 'category' => 'dakuten', 'order' => 122],
            ['character' => 'ギ', 'romaji' => 'gi', 'type' => 'katakana', 'category' => 'dakuten', 'order' => 123],
            ['character' => 'グ', 'romaji' => 'gu', 'type' => 'katakana', 'category' => 'dakuten', 'order' => 124],
            ['character' => 'ゲ', 'romaji' => 'ge', 'type' => 'katakana', 'category' => 'dakuten', 'order' => 125],
            ['character' => 'ゴ', 'romaji' => 'go', 'type' => 'katakana', 'category' => 'dakuten', 'order' => 126],
            ['character' => 'ザ', 'romaji' => 'za', 'type' => 'katakana', 'category' => 'dakuten', 'order' => 127],
            ['character' => 'ジ', 'romaji' => 'ji', 'type' => 'katakana', 'category' => 'dakuten', 'order' => 128],
            ['character' => 'ズ', 'romaji' => 'zu', 'type' => 'katakana', 'category' => 'dakuten', 'order' => 129],
            ['character' => 'ゼ', 'romaji' => 'ze', 'type' => 'katakana', 'category' => 'dakuten', 'order' => 130],
            ['character' => 'ゾ', 'romaji' => 'zo', 'type' => 'katakana', 'category' => 'dakuten', 'order' => 131],
            ['character' => 'ダ', 'romaji' => 'da', 'type' => 'katakana', 'category' => 'dakuten', 'order' => 132],
            ['character' => 'ヂ', 'romaji' => 'ji', 'type' => 'katakana', 'category' => 'dakuten', 'order' => 133],
            ['character' => 'ヅ', 'romaji' => 'zu', 'type' => 'katakana', 'category' => 'dakuten', 'order' => 134],
            ['character' => 'デ', 'romaji' => 'de', 'type' => 'katakana', 'category' => 'dakuten', 'order' => 135],
            ['character' => 'ド', 'romaji' => 'do', 'type' => 'katakana', 'category' => 'dakuten', 'order' => 136],
            ['character' => 'バ', 'romaji' => 'ba', 'type' => 'katakana', 'category' => 'dakuten', 'order' => 137],
            ['character' => 'ビ', 'romaji' => 'bi', 'type' => 'katakana', 'category' => 'dakuten', 'order' => 138],
            ['character' => 'ブ', 'romaji' => 'bu', 'type' => 'katakana', 'category' => 'dakuten', 'order' => 139],
            ['character' => 'ベ', 'romaji' => 'be', 'type' => 'katakana', 'category' => 'dakuten', 'order' => 140],
            ['character' => 'ボ', 'romaji' => 'bo', 'type' => 'katakana', 'category' => 'dakuten', 'order' => 141],

            // Handakuten katakana
            ['character' => 'パ', 'romaji' => 'pa', 'type' => 'katakana', 'category' => 'handakuten', 'order' => 142],
            ['character' => 'ピ', 'romaji' => 'pi', 'type' => 'katakana', 'category' => 'handakuten', 'order' => 143],
            ['character' => 'プ', 'romaji' => 'pu', 'type' => 'katakana', 'category' => 'handakuten', 'order' => 144],
            ['character' => 'ペ', 'romaji' => 'pe', 'type' => 'katakana', 'category' => 'handakuten', 'order' => 145],
            ['character' => 'ポ', 'romaji' => 'po', 'type' => 'katakana', 'category' => 'handakuten', 'order' => 146],

            // Small katakana
            ['character' => 'ャ', 'romaji' => 'ya', 'type' => 'katakana', 'category' => 'small', 'order' => 147],
            ['character' => 'ュ', 'romaji' => 'yu', 'type' => 'katakana', 'category' => 'small', 'order' => 148],
            ['character' => 'ョ', 'romaji' => 'yo', 'type' => 'katakana', 'category' => 'small', 'order' => 149],
            ['character' => 'ッ', 'romaji' => 'tsu', 'type' => 'katakana', 'category' => 'small', 'order' => 150],
        ];

        // Insert hiragana first
        foreach ($hiragana as $kana) {
            try {
                Kana::create($kana);
            } catch (\Exception $e) {
                // Skip duplicates silently
                continue;
            }
        }
        
        // Insert katakana
        foreach ($katakana as $kana) {
            try {
                Kana::create($kana);
            } catch (\Exception $e) {
                // Skip duplicates silently
                continue;
            }
        }
    }
}
