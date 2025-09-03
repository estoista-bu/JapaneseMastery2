<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Word;

echo "=== Embedding Format Debug ===\n";

// Get a few sample words
$words = Word::whereNotNull('embedding')->take(3)->get();

foreach ($words as $word) {
    echo "\nWord: {$word->japanese} ({$word->english})\n";
    echo "Embedding type: " . gettype($word->embedding) . "\n";
    
    if (is_string($word->embedding)) {
        echo "Embedding is string, length: " . strlen($word->embedding) . "\n";
        echo "First 100 chars: " . substr($word->embedding, 0, 100) . "\n";
        
        // Try to decode JSON
        $decoded = json_decode($word->embedding, true);
        if ($decoded !== null) {
            echo "JSON decoded successfully, type: " . gettype($decoded) . "\n";
            if (is_array($decoded)) {
                echo "Array length: " . count($decoded) . "\n";
                echo "First 5 values: " . implode(', ', array_slice($decoded, 0, 5)) . "\n";
            }
        } else {
            echo "JSON decode failed\n";
        }
    } elseif (is_array($word->embedding)) {
        echo "Embedding is array, length: " . count($word->embedding) . "\n";
        echo "First 5 values: " . implode(', ', array_slice($word->embedding, 0, 5)) . "\n";
    } else {
        echo "Embedding is: " . var_export($word->embedding, true) . "\n";
    }
}
?>
