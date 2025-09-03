<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Word;
use App\Services\WordUniquenessService;
use App\Services\EmbeddingService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ImportWordsWithUniqueness extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'words:import-with-uniqueness {--level=all : JLPT level to import (n5, n4, n3, n2, n1, all)} {--clear : Clear existing words before import}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import words from TS/JSON files with uniqueness checking using embeddings';

    private $uniquenessService;
    private $existingWords = [];
    private $stats = [
        'total_processed' => 0,
        'added' => 0,
        'exact_duplicates' => 0,
        'similarity_rejected' => 0,
        'errors' => 0
    ];

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->uniquenessService = new WordUniquenessService(new EmbeddingService());
        
        $level = $this->option('level');
        $clear = $this->option('clear');

        if ($clear) {
            if ($this->confirm('This will delete ALL existing words. Are you sure?')) {
                $this->info('Clearing existing words...');
                Word::truncate();
                $this->info('Existing words cleared.');
            } else {
                $this->info('Import cancelled.');
                return;
            }
        }

        $this->info('Starting word import with uniqueness checking...');
        $this->info('Similarity threshold: ' . $this->uniquenessService->getSimilarityThreshold());

        // Load all existing words once at the beginning
        $this->info('Loading existing words from database...');
        $this->existingWords = Word::all()->toArray();
        $this->info('Loaded ' . count($this->existingWords) . ' existing words.');

        $levels = $level === 'all' ? ['n5', 'n4', 'n3', 'n2', 'n1'] : [$level];

        foreach ($levels as $jlptLevel) {
            $this->importLevel($jlptLevel);
        }

        $this->displayStats();
    }

    private function importLevel(string $level)
    {
        $this->info("\nProcessing JLPT {$level}...");

        // Try TS file first, then JSON
        $tsFile = base_path("../data/{$level}-words.ts");
        $jsonFile = base_path("../data/{$level}-words.json");

        if (file_exists($tsFile)) {
            $this->importFromTsFile($tsFile, $level);
        } elseif (file_exists($jsonFile)) {
            $this->importFromJsonFile($jsonFile, $level);
        } else {
            $this->warn("No word file found for {$level}");
            return;
        }
    }

    private function importFromTsFile(string $filePath, string $level)
    {
        $this->info("Importing from TS file: {$filePath}");

        $content = file_get_contents($filePath);
        
        // Extract the words array from the TS file
        if (preg_match('/export const ' . $level . 'Words:.*?= \[(.*?)\];/s', $content, $matches)) {
            $wordsSection = $matches[1];
            
            // Parse the words using regex
            preg_match_all('/\{[^}]+\}/', $wordsSection, $wordMatches);
            
            foreach ($wordMatches[0] as $wordString) {
                $this->processWordFromTs($wordString, $level);
            }
        } else {
            $this->error("Could not parse TS file structure");
        }
    }

    private function importFromJsonFile(string $filePath, string $level)
    {
        $this->info("Importing from JSON file: {$filePath}");

        $content = file_get_contents($filePath);
        $words = json_decode($content, true);

        if (!$words) {
            $this->error("Could not parse JSON file");
            return;
        }

        foreach ($words as $word) {
            $this->processWordFromJson($word, $level);
        }
    }

    private function processWordFromTs(string $wordString, string $level)
    {
        $this->stats['total_processed']++;

        // Extract word data using regex
        preg_match('/id:\s*"([^"]+)"/', $wordString, $idMatch);
        preg_match('/japanese:\s*"([^"]+)"/', $wordString, $japaneseMatch);
        preg_match('/reading:\s*"([^"]+)"/', $wordString, $readingMatch);
        preg_match('/meaning:\s*"([^"]+)"/', $wordString, $meaningMatch);

        // Debug: Check what was found
        $this->info("Parsing word: {$wordString}");
        $this->info("ID match: " . ($idMatch ? $idMatch[1] : 'NOT FOUND'));
        $this->info("Japanese match: " . ($japaneseMatch ? $japaneseMatch[1] : 'NOT FOUND'));
        $this->info("Reading match: " . ($readingMatch ? $readingMatch[1] : 'NOT FOUND'));
        $this->info("Meaning match: " . ($meaningMatch ? $meaningMatch[1] : 'NOT FOUND'));

        if (!$idMatch || !$japaneseMatch || !$readingMatch || !$meaningMatch) {
            $this->stats['errors']++;
            $this->warn("Could not parse word: {$wordString}");
            return;
        }

        $wordData = [
            'japanese' => $japaneseMatch[1],
            'reading' => $readingMatch[1],
            'english' => $meaningMatch[1], // meaning in TS = english in database
            'jlpt_level' => strtoupper($level),
            'part_of_speech' => null,
            'example_sentence' => null
        ];

        $this->processWord($wordData);
    }

    private function processWordFromJson(array $word, string $level)
    {
        $this->stats['total_processed']++;

        $wordData = [
            'japanese' => $word['japanese'] ?? '',
            'reading' => $word['reading'] ?? '',
            'english' => $word['english'] ?? $word['meaning'] ?? '',
            'jlpt_level' => strtoupper($level),
            'part_of_speech' => null,
            'example_sentence' => null
        ];

        $this->processWord($wordData);
    }

    private function processWord(array $wordData)
    {
        try {
            // Check uniqueness using pre-loaded existing words
            if ($this->uniquenessService->isWordUnique($wordData, $this->existingWords)) {
                // Create the word
                Word::create($wordData);
                $this->stats['added']++;
                $this->info("✓ Added: {$wordData['japanese']} ({$wordData['reading']}) - {$wordData['english']}");
            } else {
                // Check if it was an exact duplicate or similarity rejection
                $existing = Word::where('japanese', $wordData['japanese'])
                    ->where('reading', $wordData['reading'])
                    ->where('english', $wordData['english'])
                    ->first();

                if ($existing) {
                    $this->stats['exact_duplicates']++;
                    $this->line("○ Exact duplicate: {$wordData['japanese']} ({$wordData['reading']}) - {$wordData['english']}");
                } else {
                    $this->stats['similarity_rejected']++;
                    $this->warn("✗ Similarity rejected: {$wordData['japanese']} ({$wordData['reading']}) - {$wordData['english']}");
                }
            }
        } catch (\Exception $e) {
            $this->stats['errors']++;
            $this->error("Error processing word: {$wordData['japanese']} - {$e->getMessage()}");
        }
    }

    private function displayStats()
    {
        $this->info("\n" . str_repeat('=', 50));
        $this->info('IMPORT STATISTICS');
        $this->info(str_repeat('=', 50));
        $this->info("Total processed: {$this->stats['total_processed']}");
        $this->info("Words added: {$this->stats['added']}");
        $this->info("Exact duplicates: {$this->stats['exact_duplicates']}");
        $this->info("Similarity rejected: {$this->stats['similarity_rejected']}");
        $this->info("Errors: {$this->stats['errors']}");
        $this->info(str_repeat('=', 50));
    }
}
