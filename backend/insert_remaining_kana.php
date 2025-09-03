<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Kana;

echo "=== INSERTING REMAINING KANA CHARACTERS ===\n";

// Dakuten hiragana (voiced consonants)
$dakutenHiragana = [
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
];

// Handakuten hiragana (half-voiced consonants)
$handakutenHiragana = [
    ['character' => 'ぱ', 'romaji' => 'pa', 'type' => 'hiragana', 'category' => 'handakuten', 'order' => 67],
    ['character' => 'ぴ', 'romaji' => 'pi', 'type' => 'hiragana', 'category' => 'handakuten', 'order' => 68],
    ['character' => 'ぷ', 'romaji' => 'pu', 'type' => 'hiragana', 'category' => 'handakuten', 'order' => 69],
    ['character' => 'ぺ', 'romaji' => 'pe', 'type' => 'hiragana', 'category' => 'handakuten', 'order' => 70],
    ['character' => 'ぽ', 'romaji' => 'po', 'type' => 'hiragana', 'category' => 'handakuten', 'order' => 71],
];

// Hiragana combinations with small kana
$hiraganaCombinations = [
    // Basic hiragana + ゃ combinations
    ['character' => 'きゃ', 'romaji' => 'kya', 'type' => 'hiragana', 'category' => 'combination', 'order' => 72],
    ['character' => 'しゃ', 'romaji' => 'sha', 'type' => 'hiragana', 'category' => 'combination', 'order' => 73],
    ['character' => 'ちゃ', 'romaji' => 'cha', 'type' => 'hiragana', 'category' => 'combination', 'order' => 74],
    ['character' => 'にゃ', 'romaji' => 'nya', 'type' => 'hiragana', 'category' => 'combination', 'order' => 75],
    ['character' => 'ひゃ', 'romaji' => 'hya', 'type' => 'hiragana', 'category' => 'combination', 'order' => 76],
    ['character' => 'みゃ', 'romaji' => 'mya', 'type' => 'hiragana', 'category' => 'combination', 'order' => 77],
    ['character' => 'りゃ', 'romaji' => 'rya', 'type' => 'hiragana', 'category' => 'combination', 'order' => 78],
    ['character' => 'ぎゃ', 'romaji' => 'gya', 'type' => 'hiragana', 'category' => 'combination', 'order' => 79],
    ['character' => 'じゃ', 'romaji' => 'ja', 'type' => 'hiragana', 'category' => 'combination', 'order' => 80],
    ['character' => 'びゃ', 'romaji' => 'bya', 'type' => 'hiragana', 'category' => 'combination', 'order' => 81],
    ['character' => 'ぴゃ', 'romaji' => 'pya', 'type' => 'hiragana', 'category' => 'combination', 'order' => 82],
    
    // Basic hiragana + ゅ combinations
    ['character' => 'きゅ', 'romaji' => 'kyu', 'type' => 'hiragana', 'category' => 'combination', 'order' => 83],
    ['character' => 'しゅ', 'romaji' => 'shu', 'type' => 'hiragana', 'category' => 'combination', 'order' => 84],
    ['character' => 'ちゅ', 'romaji' => 'chu', 'type' => 'hiragana', 'category' => 'combination', 'order' => 85],
    ['character' => 'にゅ', 'romaji' => 'nyu', 'type' => 'hiragana', 'category' => 'combination', 'order' => 86],
    ['character' => 'ひゅ', 'romaji' => 'hyu', 'type' => 'hiragana', 'category' => 'combination', 'order' => 87],
    ['character' => 'みゅ', 'romaji' => 'myu', 'type' => 'hiragana', 'category' => 'combination', 'order' => 88],
    ['character' => 'りゅ', 'romaji' => 'ryu', 'type' => 'hiragana', 'category' => 'combination', 'order' => 89],
    ['character' => 'ぎゅ', 'romaji' => 'gyu', 'type' => 'hiragana', 'category' => 'combination', 'order' => 90],
    ['character' => 'じゅ', 'romaji' => 'ju', 'type' => 'hiragana', 'category' => 'combination', 'order' => 91],
    ['character' => 'びゅ', 'romaji' => 'byu', 'type' => 'hiragana', 'category' => 'combination', 'order' => 92],
    ['character' => 'ぴゅ', 'romaji' => 'pyu', 'type' => 'hiragana', 'category' => 'combination', 'order' => 93],
    
    // Basic hiragana + ょ combinations
    ['character' => 'きょ', 'romaji' => 'kyo', 'type' => 'hiragana', 'category' => 'combination', 'order' => 94],
    ['character' => 'しょ', 'romaji' => 'sho', 'type' => 'hiragana', 'category' => 'combination', 'order' => 95],
    ['character' => 'ちょ', 'romaji' => 'cho', 'type' => 'hiragana', 'category' => 'combination', 'order' => 96],
    ['character' => 'にょ', 'romaji' => 'nyo', 'type' => 'hiragana', 'category' => 'combination', 'order' => 97],
    ['character' => 'ひょ', 'romaji' => 'hyo', 'type' => 'hiragana', 'category' => 'combination', 'order' => 98],
    ['character' => 'みょ', 'romaji' => 'myo', 'type' => 'hiragana', 'category' => 'combination', 'order' => 99],
    ['character' => 'りょ', 'romaji' => 'ryo', 'type' => 'hiragana', 'category' => 'combination', 'order' => 100],
    ['character' => 'ぎょ', 'romaji' => 'gyo', 'type' => 'hiragana', 'category' => 'combination', 'order' => 101],
    ['character' => 'じょ', 'romaji' => 'jo', 'type' => 'hiragana', 'category' => 'combination', 'order' => 102],
    ['character' => 'びょ', 'romaji' => 'byo', 'type' => 'hiragana', 'category' => 'combination', 'order' => 103],
    ['character' => 'ぴょ', 'romaji' => 'pyo', 'type' => 'hiragana', 'category' => 'combination', 'order' => 104],
];

// Basic katakana
$basicKatakana = [
    ['character' => 'ア', 'romaji' => 'a', 'type' => 'katakana', 'category' => 'basic', 'order' => 105],
    ['character' => 'イ', 'romaji' => 'i', 'type' => 'katakana', 'category' => 'basic', 'order' => 106],
    ['character' => 'ウ', 'romaji' => 'u', 'type' => 'katakana', 'category' => 'basic', 'order' => 107],
    ['character' => 'エ', 'romaji' => 'e', 'type' => 'katakana', 'category' => 'basic', 'order' => 108],
    ['character' => 'オ', 'romaji' => 'o', 'type' => 'katakana', 'category' => 'basic', 'order' => 109],
    ['character' => 'カ', 'romaji' => 'ka', 'type' => 'katakana', 'category' => 'basic', 'order' => 110],
    ['character' => 'キ', 'romaji' => 'ki', 'type' => 'katakana', 'category' => 'basic', 'order' => 111],
    ['character' => 'ク', 'romaji' => 'ku', 'type' => 'katakana', 'category' => 'basic', 'order' => 112],
    ['character' => 'ケ', 'romaji' => 'ke', 'type' => 'katakana', 'category' => 'basic', 'order' => 113],
    ['character' => 'コ', 'romaji' => 'ko', 'type' => 'katakana', 'category' => 'basic', 'order' => 114],
    ['character' => 'サ', 'romaji' => 'sa', 'type' => 'katakana', 'category' => 'basic', 'order' => 115],
    ['character' => 'シ', 'romaji' => 'shi', 'type' => 'katakana', 'category' => 'basic', 'order' => 116],
    ['character' => 'ス', 'romaji' => 'su', 'type' => 'katakana', 'category' => 'basic', 'order' => 117],
    ['character' => 'セ', 'romaji' => 'se', 'type' => 'katakana', 'category' => 'basic', 'order' => 118],
    ['character' => 'ソ', 'romaji' => 'so', 'type' => 'katakana', 'category' => 'basic', 'order' => 119],
    ['character' => 'タ', 'romaji' => 'ta', 'type' => 'katakana', 'category' => 'basic', 'order' => 120],
    ['character' => 'チ', 'romaji' => 'chi', 'type' => 'katakana', 'category' => 'basic', 'order' => 121],
    ['character' => 'ツ', 'romaji' => 'tsu', 'type' => 'katakana', 'category' => 'basic', 'order' => 122],
    ['character' => 'テ', 'romaji' => 'te', 'type' => 'katakana', 'category' => 'basic', 'order' => 123],
    ['character' => 'ト', 'romaji' => 'to', 'type' => 'katakana', 'category' => 'basic', 'order' => 124],
    ['character' => 'ナ', 'romaji' => 'na', 'type' => 'katakana', 'category' => 'basic', 'order' => 125],
    ['character' => 'ニ', 'romaji' => 'ni', 'type' => 'katakana', 'category' => 'basic', 'order' => 126],
    ['character' => 'ヌ', 'romaji' => 'nu', 'type' => 'katakana', 'category' => 'basic', 'order' => 127],
    ['character' => 'ネ', 'romaji' => 'ne', 'type' => 'katakana', 'category' => 'basic', 'order' => 128],
    ['character' => 'ノ', 'romaji' => 'no', 'type' => 'katakana', 'category' => 'basic', 'order' => 129],
    ['character' => 'ハ', 'romaji' => 'ha', 'type' => 'katakana', 'category' => 'basic', 'order' => 130],
    ['character' => 'ヒ', 'romaji' => 'hi', 'type' => 'katakana', 'category' => 'basic', 'order' => 131],
    ['character' => 'フ', 'romaji' => 'fu', 'type' => 'katakana', 'category' => 'basic', 'order' => 132],
    ['character' => 'ヘ', 'romaji' => 'he', 'type' => 'katakana', 'category' => 'basic', 'order' => 133],
    ['character' => 'ホ', 'romaji' => 'ho', 'type' => 'katakana', 'category' => 'basic', 'order' => 134],
    ['character' => 'マ', 'romaji' => 'ma', 'type' => 'katakana', 'category' => 'basic', 'order' => 135],
    ['character' => 'ミ', 'romaji' => 'mi', 'type' => 'katakana', 'category' => 'basic', 'order' => 136],
    ['character' => 'ム', 'romaji' => 'mu', 'type' => 'katakana', 'category' => 'basic', 'order' => 137],
    ['character' => 'メ', 'romaji' => 'me', 'type' => 'katakana', 'category' => 'basic', 'order' => 138],
    ['character' => 'モ', 'romaji' => 'mo', 'type' => 'katakana', 'category' => 'basic', 'order' => 139],
    ['character' => 'ヤ', 'romaji' => 'ya', 'type' => 'katakana', 'category' => 'basic', 'order' => 140],
    ['character' => 'ユ', 'romaji' => 'yu', 'type' => 'katakana', 'category' => 'basic', 'order' => 141],
    ['character' => 'ヨ', 'romaji' => 'yo', 'type' => 'katakana', 'category' => 'basic', 'order' => 142],
    ['character' => 'ラ', 'romaji' => 'ra', 'type' => 'katakana', 'category' => 'basic', 'order' => 143],
    ['character' => 'リ', 'romaji' => 'ri', 'type' => 'katakana', 'category' => 'basic', 'order' => 144],
    ['character' => 'ル', 'romaji' => 'ru', 'type' => 'katakana', 'category' => 'basic', 'order' => 145],
    ['character' => 'レ', 'romaji' => 're', 'type' => 'katakana', 'category' => 'basic', 'order' => 146],
    ['character' => 'ロ', 'romaji' => 'ro', 'type' => 'katakana', 'category' => 'basic', 'order' => 147],
    ['character' => 'ワ', 'romaji' => 'wa', 'type' => 'katakana', 'category' => 'basic', 'order' => 148],
    ['character' => 'ヲ', 'romaji' => 'wo', 'type' => 'katakana', 'category' => 'basic', 'order' => 149],
    ['character' => 'ン', 'romaji' => 'n', 'type' => 'katakana', 'category' => 'basic', 'order' => 150],
];

// Dakuten katakana (voiced consonants)
$dakutenKatakana = [
    ['character' => 'ガ', 'romaji' => 'ga', 'type' => 'katakana', 'category' => 'dakuten', 'order' => 151],
    ['character' => 'ギ', 'romaji' => 'gi', 'type' => 'katakana', 'category' => 'dakuten', 'order' => 152],
    ['character' => 'グ', 'romaji' => 'gu', 'type' => 'katakana', 'category' => 'dakuten', 'order' => 153],
    ['character' => 'ゲ', 'romaji' => 'ge', 'type' => 'katakana', 'category' => 'dakuten', 'order' => 154],
    ['character' => 'ゴ', 'romaji' => 'go', 'type' => 'katakana', 'category' => 'dakuten', 'order' => 155],
    ['character' => 'ザ', 'romaji' => 'za', 'type' => 'katakana', 'category' => 'dakuten', 'order' => 156],
    ['character' => 'ジ', 'romaji' => 'ji', 'type' => 'katakana', 'category' => 'dakuten', 'order' => 157],
    ['character' => 'ズ', 'romaji' => 'zu', 'type' => 'katakana', 'category' => 'dakuten', 'order' => 158],
    ['character' => 'ゼ', 'romaji' => 'ze', 'type' => 'katakana', 'category' => 'dakuten', 'order' => 159],
    ['character' => 'ゾ', 'romaji' => 'zo', 'type' => 'katakana', 'category' => 'dakuten', 'order' => 160],
    ['character' => 'ダ', 'romaji' => 'da', 'type' => 'katakana', 'category' => 'dakuten', 'order' => 161],
    ['character' => 'ヂ', 'romaji' => 'ji', 'type' => 'katakana', 'category' => 'dakuten', 'order' => 162],
    ['character' => 'ヅ', 'romaji' => 'zu', 'type' => 'katakana', 'category' => 'dakuten', 'order' => 163],
    ['character' => 'デ', 'romaji' => 'de', 'type' => 'katakana', 'category' => 'dakuten', 'order' => 164],
    ['character' => 'ド', 'romaji' => 'do', 'type' => 'katakana', 'category' => 'dakuten', 'order' => 165],
    ['character' => 'バ', 'romaji' => 'ba', 'type' => 'katakana', 'category' => 'dakuten', 'order' => 166],
    ['character' => 'ビ', 'romaji' => 'bi', 'type' => 'katakana', 'category' => 'dakuten', 'order' => 167],
    ['character' => 'ブ', 'romaji' => 'bu', 'type' => 'katakana', 'category' => 'dakuten', 'order' => 168],
    ['character' => 'ベ', 'romaji' => 'be', 'type' => 'katakana', 'category' => 'dakuten', 'order' => 169],
    ['character' => 'ボ', 'romaji' => 'bo', 'type' => 'katakana', 'category' => 'dakuten', 'order' => 170],
];

// Handakuten katakana (half-voiced consonants)
$handakutenKatakana = [
    ['character' => 'パ', 'romaji' => 'pa', 'type' => 'katakana', 'category' => 'handakuten', 'order' => 171],
    ['character' => 'ピ', 'romaji' => 'pi', 'type' => 'katakana', 'category' => 'handakuten', 'order' => 172],
    ['character' => 'プ', 'romaji' => 'pu', 'type' => 'katakana', 'category' => 'handakuten', 'order' => 173],
    ['character' => 'ペ', 'romaji' => 'pe', 'type' => 'katakana', 'category' => 'handakuten', 'order' => 174],
    ['character' => 'ポ', 'romaji' => 'po', 'type' => 'katakana', 'category' => 'handakuten', 'order' => 175],
];

// Katakana combinations with small kana
$katakanaCombinations = [
    // Basic katakana + ャ combinations
    ['character' => 'キャ', 'romaji' => 'kya', 'type' => 'katakana', 'category' => 'combination', 'order' => 176],
    ['character' => 'シャ', 'romaji' => 'sha', 'type' => 'katakana', 'category' => 'combination', 'order' => 177],
    ['character' => 'チャ', 'romaji' => 'cha', 'type' => 'katakana', 'category' => 'combination', 'order' => 178],
    ['character' => 'ニャ', 'romaji' => 'nya', 'type' => 'katakana', 'category' => 'combination', 'order' => 179],
    ['character' => 'ヒャ', 'romaji' => 'hya', 'type' => 'katakana', 'category' => 'combination', 'order' => 180],
    ['character' => 'ミャ', 'romaji' => 'mya', 'type' => 'katakana', 'category' => 'combination', 'order' => 181],
    ['character' => 'リャ', 'romaji' => 'rya', 'type' => 'katakana', 'category' => 'combination', 'order' => 182],
    ['character' => 'ギャ', 'romaji' => 'gya', 'type' => 'katakana', 'category' => 'combination', 'order' => 183],
    ['character' => 'ジャ', 'romaji' => 'ja', 'type' => 'katakana', 'category' => 'combination', 'order' => 184],
    ['character' => 'ビャ', 'romaji' => 'bya', 'type' => 'katakana', 'category' => 'combination', 'order' => 185],
    ['character' => 'ピャ', 'romaji' => 'pya', 'type' => 'katakana', 'category' => 'combination', 'order' => 186],
    
    // Basic katakana + ュ combinations
    ['character' => 'キュ', 'romaji' => 'kyu', 'type' => 'katakana', 'category' => 'combination', 'order' => 187],
    ['character' => 'シュ', 'romaji' => 'shu', 'type' => 'katakana', 'category' => 'combination', 'order' => 188],
    ['character' => 'チュ', 'romaji' => 'chu', 'type' => 'katakana', 'category' => 'combination', 'order' => 189],
    ['character' => 'ニュ', 'romaji' => 'nyu', 'type' => 'katakana', 'category' => 'combination', 'order' => 190],
    ['character' => 'ヒュ', 'romaji' => 'hyu', 'type' => 'katakana', 'category' => 'combination', 'order' => 191],
    ['character' => 'ミュ', 'romaji' => 'myu', 'type' => 'katakana', 'category' => 'combination', 'order' => 192],
    ['character' => 'リュ', 'romaji' => 'ryu', 'type' => 'katakana', 'category' => 'combination', 'order' => 193],
    ['character' => 'ギュ', 'romaji' => 'gyu', 'type' => 'katakana', 'category' => 'combination', 'order' => 194],
    ['character' => 'ジュ', 'romaji' => 'ju', 'type' => 'katakana', 'category' => 'combination', 'order' => 195],
    ['character' => 'ビュ', 'romaji' => 'byu', 'type' => 'katakana', 'category' => 'combination', 'order' => 196],
    ['character' => 'ピュ', 'romaji' => 'pyu', 'type' => 'katakana', 'category' => 'combination', 'order' => 197],
    
    // Basic katakana + ョ combinations
    ['character' => 'キョ', 'romaji' => 'kyo', 'type' => 'katakana', 'category' => 'combination', 'order' => 198],
    ['character' => 'ショ', 'romaji' => 'sho', 'type' => 'katakana', 'category' => 'combination', 'order' => 199],
    ['character' => 'チョ', 'romaji' => 'cho', 'type' => 'katakana', 'category' => 'combination', 'order' => 200],
    ['character' => 'ニョ', 'romaji' => 'nyo', 'type' => 'katakana', 'category' => 'combination', 'order' => 201],
    ['character' => 'ヒョ', 'romaji' => 'hyo', 'type' => 'katakana', 'category' => 'combination', 'order' => 202],
    ['character' => 'ミョ', 'romaji' => 'myo', 'type' => 'katakana', 'category' => 'combination', 'order' => 203],
    ['character' => 'リョ', 'romaji' => 'ryo', 'type' => 'katakana', 'category' => 'combination', 'order' => 204],
    ['character' => 'ギョ', 'romaji' => 'gyo', 'type' => 'katakana', 'category' => 'combination', 'order' => 205],
    ['character' => 'ジョ', 'romaji' => 'jo', 'type' => 'katakana', 'category' => 'combination', 'order' => 206],
    ['character' => 'ビョ', 'romaji' => 'byo', 'type' => 'katakana', 'category' => 'combination', 'order' => 207],
    ['character' => 'ピョ', 'romaji' => 'pyo', 'type' => 'katakana', 'category' => 'combination', 'order' => 208],
];

// Combine all remaining kana
$allRemainingKana = array_merge(
    $dakutenHiragana,
    $handakutenHiragana,
    $hiraganaCombinations,
    $basicKatakana,
    $dakutenKatakana,
    $handakutenKatakana,
    $katakanaCombinations
);

echo "Inserting dakuten hiragana...\n";
foreach ($dakutenHiragana as $kana) {
    try {
        Kana::create($kana);
        echo "✓ {$kana['character']} ({$kana['romaji']}) - {$kana['category']}\n";
    } catch (\Exception $e) {
        echo "✗ ERROR with {$kana['character']}: " . $e->getMessage() . "\n";
    }
}

echo "\nInserting handakuten hiragana...\n";
foreach ($handakutenHiragana as $kana) {
    try {
        Kana::create($kana);
        echo "✓ {$kana['character']} ({$kana['romaji']}) - {$kana['category']}\n";
    } catch (\Exception $e) {
        echo "✗ ERROR with {$kana['character']}: " . $e->getMessage() . "\n";
    }
}

echo "\nInserting hiragana combinations...\n";
foreach ($hiraganaCombinations as $kana) {
    try {
        Kana::create($kana);
        echo "✓ {$kana['character']} ({$kana['romaji']}) - {$kana['category']}\n";
    } catch (\Exception $e) {
        echo "✗ ERROR with {$kana['character']}: " . $e->getMessage() . "\n";
    }
}

echo "\nInserting basic katakana...\n";
foreach ($basicKatakana as $kana) {
    try {
        Kana::create($kana);
        echo "✓ {$kana['character']} ({$kana['romaji']}) - {$kana['category']}\n";
    } catch (\Exception $e) {
        echo "✗ ERROR with {$kana['character']}: " . $e->getMessage() . "\n";
    }
}

echo "\nInserting dakuten katakana...\n";
foreach ($dakutenKatakana as $kana) {
    try {
        Kana::create($kana);
        echo "✓ {$kana['character']} ({$kana['romaji']}) - {$kana['category']}\n";
    } catch (\Exception $e) {
        echo "✗ ERROR with {$kana['character']}: " . $e->getMessage() . "\n";
    }
}

echo "\nInserting handakuten katakana...\n";
foreach ($handakutenKatakana as $kana) {
    try {
        Kana::create($kana);
        echo "✓ {$kana['character']} ({$kana['romaji']}) - {$kana['category']}\n";
    } catch (\Exception $e) {
        echo "✗ ERROR with {$kana['character']}: " . $e->getMessage() . "\n";
    }
}

echo "\nInserting katakana combinations...\n";
foreach ($katakanaCombinations as $kana) {
    try {
        Kana::create($kana);
        echo "✓ {$kana['character']} ({$kana['romaji']}) - {$kana['category']}\n";
    } catch (\Exception $e) {
        echo "✗ ERROR with {$kana['character']}: " . $e->getMessage() . "\n";
    }
}

echo "\n=== FINAL SUMMARY ===\n";
echo "Total kana in database: " . Kana::count() . "\n";
echo "Hiragana: " . Kana::where('type', 'hiragana')->count() . "\n";
echo "Katakana: " . Kana::where('type', 'katakana')->count() . "\n";
echo "Basic: " . Kana::where('category', 'basic')->count() . "\n";
echo "Dakuten: " . Kana::where('category', 'dakuten')->count() . "\n";
echo "Handakuten: " . Kana::where('category', 'handakuten')->count() . "\n";
echo "Combinations: " . Kana::where('category', 'combination')->count() . "\n";
echo "=== COMPLETE! ===\n";

