<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Word;

echo "=== Embedding Status Check ===\n";
echo "Total words: " . Word::count() . "\n";
echo "Words with embeddings: " . Word::whereNotNull('embedding')->count() . "\n";
echo "Words without embeddings: " . Word::whereNull('embedding')->count() . "\n";

// Show a few examples of words with embeddings
$wordsWithEmbeddings = Word::whereNotNull('embedding')->take(5)->get();
echo "\n=== Sample words with embeddings ===\n";
foreach ($wordsWithEmbeddings as $word) {
    echo "- {$word->japanese} ({$word->english})\n";
}

// Show a few examples of words without embeddings
$wordsWithoutEmbeddings = Word::whereNull('embedding')->take(5)->get();
echo "\n=== Sample words without embeddings ===\n";
foreach ($wordsWithoutEmbeddings as $word) {
    echo "- {$word->japanese} ({$word->english})\n";
}
?>
