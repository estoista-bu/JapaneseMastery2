<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Word;
use App\Models\Deck;
use Illuminate\Support\Facades\File;

class ImportJlptWords extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'jlpt:import {file : Path to the JLPT word file} {--deck= : Deck slug to import into}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import JLPT words from a JSON file';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $filePath = $this->argument('file');
        $deckSlug = $this->option('deck');

        if (!File::exists($filePath)) {
            $this->error("File not found: {$filePath}");
            return 1;
        }

        $deck = null;
        if ($deckSlug) {
            $deck = Deck::where('slug', $deckSlug)->first();
            if (!$deck) {
                $this->error("Deck not found: {$deckSlug}");
                return 1;
            }
        }

        $content = File::get($filePath);
        $words = json_decode($content, true);

        if (!$words) {
            $this->error("Invalid JSON file");
            return 1;
        }

        $this->info("Importing " . count($words) . " words...");

        $imported = 0;
        $skipped = 0;

        foreach ($words as $wordData) {
            try {
                // Create or update word
                $word = Word::updateOrCreate(
                    ['japanese' => $wordData['japanese']],
                    [
                        'reading' => $wordData['reading'] ?? null,
                        'english' => $wordData['english'],
                        'jlpt_level' => $wordData['jlpt_level'] ?? null,
                        'part_of_speech' => $wordData['part_of_speech'] ?? null,
                        'example_sentence' => $wordData['example_sentence'] ?? null,
                    ]
                );

                // Associate with deck if specified
                if ($deck) {
                    $deck->words()->syncWithoutDetaching([$word->id]);
                }

                $imported++;
                $this->line("✓ Imported: {$wordData['japanese']}");

            } catch (\Exception $e) {
                $skipped++;
                $this->warn("✗ Skipped: {$wordData['japanese']} - {$e->getMessage()}");
            }
        }

        // Update deck word count if deck was specified
        if ($deck) {
            $deck->updateWordCount();
        }

        $this->info("\nImport completed!");
        $this->info("Imported: {$imported}");
        $this->info("Skipped: {$skipped}");

        return 0;
    }
} 