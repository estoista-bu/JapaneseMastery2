<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\EmbeddingService;

class GenerateEmbeddings extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'embeddings:generate {--word-id= : Generate embedding for specific word ID}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate embeddings for words using Ollama';

    /**
     * Execute the console command.
     */
    public function handle(EmbeddingService $embeddingService)
    {
        $wordId = $this->option('word-id');
        
        if ($wordId) {
            $this->generateForSingleWord($wordId, $embeddingService);
        } else {
            $this->generateForAllWords($embeddingService);
        }
    }

    private function generateForSingleWord($wordId, EmbeddingService $embeddingService)
    {
        $word = \App\Models\Word::find($wordId);
        
        if (!$word) {
            $this->error("Word with ID {$wordId} not found.");
            return;
        }

        $this->info("Generating embedding for word: {$word->japanese} ({$word->english})");
        
        if ($embeddingService->generateEmbeddingForWord($word)) {
            $this->info("✅ Successfully generated embedding for: {$word->japanese}");
        } else {
            $this->error("❌ Failed to generate embedding for: {$word->japanese}");
        }
    }

    private function generateForAllWords(EmbeddingService $embeddingService)
    {
        $totalWords = \App\Models\Word::whereNull('embedding')->count();
        
        if ($totalWords === 0) {
            $this->info("All words already have embeddings!");
            return;
        }

        $this->info("Starting embedding generation for {$totalWords} words...");
        $this->info("This may take a while. Press Ctrl+C to stop.");
        
        $startTime = microtime(true);
        
        $result = $embeddingService->generateEmbeddings();
        
        $endTime = microtime(true);
        $duration = round($endTime - $startTime, 2);
        
        $this->info("✅ Embedding generation complete!");
        $this->info("📊 Results:");
        $this->info("   - Total words: {$result['total']}");
        $this->info("   - Processed: {$result['processed']}");
        $this->info("   - Failed: {$result['failed']}");
        $this->info("   - Duration: {$duration} seconds");
        
        if ($result['failed'] > 0) {
            $this->warn("⚠️  {$result['failed']} words failed. Check the logs for details.");
        }
    }
}

