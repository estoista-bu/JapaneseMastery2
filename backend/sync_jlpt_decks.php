<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Deck;
use App\Models\Word;
use Illuminate\Support\Facades\DB;

echo "Starting JLPT deck sync...\n";

$jlptLevels = ['N5', 'N4', 'N3', 'N2', 'N1'];

foreach ($jlptLevels as $level) {
    try {
        // Find deck by slug
        $deck = Deck::where('slug', 'jlpt-' . strtolower($level))->first();
        if (!$deck) {
            echo "Deck for {$level} not found, skipping...\n";
            continue;
        }

        echo "Found {$level} deck: {$deck->name}\n";

        // Get all words for this JLPT level
        $words = Word::where('jlpt_level', $level)->get();
        $wordCount = $words->count();
        echo "Found {$wordCount} words for {$level}\n";

        // Start transaction
        DB::beginTransaction();

        try {
            // Clear existing deck-word relationships
            $deck->words()->detach();
            echo "Cleared existing word relationships for {$level}\n";

            // Attach all words with order
            foreach ($words as $index => $word) {
                $deck->words()->attach($word->id, ['order' => $index]);
            }

            // Update word count in deck (assuming your model has this method)
            $deck->updateWordCount();

            DB::commit();
            echo "Successfully associated {$wordCount} words with {$level} deck\n";

        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
        }

    } catch (\Exception $e) {
        echo "Error syncing {$level} deck: " . $e->getMessage() . "\n";
    }
}

echo "All JLPT deck syncs completed successfully!\n";
