<?php

namespace App\Services;

use App\Models\Word;
use Illuminate\Support\Facades\Log;

class WordUniquenessService
{
    private $embeddingService;
    private $similarityThreshold = 0.985;

    public function __construct(EmbeddingService $embeddingService)
    {
        $this->embeddingService = $embeddingService;
    }

    /**
     * Check if a word is unique enough to be added to the database
     */
    public function isWordUnique(array $candidateWord, array $existingWords = null): bool
    {
        // If no existing words provided, get all from database
        if ($existingWords === null) {
            $existingWords = Word::all()->toArray();
        }

        // Step 1: Check exact matches (japanese + reading + english)
        $exactMatch = $this->findExactMatch($candidateWord, $existingWords);
        if ($exactMatch) {
            Log::info('Exact duplicate found', [
                'candidate' => $candidateWord,
                'existing' => $exactMatch
            ]);
            return false; // Exact duplicate found
        }

        // Step 2: Find words with same japanese + reading
        $sameWritingReading = $this->findSameWritingReading($candidateWord, $existingWords);
        
        if (empty($sameWritingReading)) {
            Log::info('No words with same writing and reading found', [
                'candidate' => $candidateWord
            ]);
            return true; // No similar words found
        }

        // Step 3: Check english similarity using embeddings
        return $this->checkEnglishSimilarity($candidateWord, $sameWritingReading);
    }

    /**
     * Find exact match (same japanese, reading, and english)
     */
    private function findExactMatch(array $candidate, array $existingWords): ?array
    {
        foreach ($existingWords as $existing) {
            if ($existing['japanese'] === $candidate['japanese'] &&
                $existing['reading'] === $candidate['reading'] &&
                strtolower(trim($existing['english'])) === strtolower(trim($candidate['english']))) {
                return $existing;
            }
        }
        return null;
    }

    /**
     * Find words with same japanese writing and reading
     */
    private function findSameWritingReading(array $candidate, array $existingWords): array
    {
        $matches = [];
        foreach ($existingWords as $existing) {
            if ($existing['japanese'] === $candidate['japanese'] &&
                $existing['reading'] === $candidate['reading']) {
                $matches[] = $existing;
            }
        }
        return $matches;
    }

    /**
     * Check english similarity using embeddings
     */
    private function checkEnglishSimilarity(array $candidate, array $existingWords): bool
    {
        try {
            // First, check for exact string matches (fast comparison)
            foreach ($existingWords as $existing) {
                if (strtolower(trim($candidate['english'])) === strtolower(trim($existing['english']))) {
                    Log::info('Word rejected due to exact match', [
                        'candidate' => $candidate['english'],
                        'existing' => $existing['english']
                    ]);
                    return false; // Exact match found, don't add
                }
            }

            // Generate embedding for candidate word
            $candidateEmbedding = $this->embeddingService->getQueryEmbedding($candidate['english']);
            
            if (!$candidateEmbedding) {
                Log::warning('Failed to generate embedding for candidate word', [
                    'candidate' => $candidate
                ]);
                return true; // If embedding fails, allow the word to be added
            }

            foreach ($existingWords as $existing) {
                // Generate embedding for existing word
                $existingEmbedding = $this->embeddingService->getQueryEmbedding($existing['english']);
                
                if (!$existingEmbedding) {
                    Log::warning('Failed to generate embedding for existing word', [
                        'existing' => $existing
                    ]);
                    continue; // Skip this comparison
                }

                $similarity = $this->calculateCosineSimilarity($candidateEmbedding, $existingEmbedding);
                
                Log::info('English similarity check', [
                    'candidate' => $candidate['english'],
                    'existing' => $existing['english'],
                    'similarity' => $similarity,
                    'threshold' => $this->similarityThreshold
                ]);

                if ($similarity >= $this->similarityThreshold) {
                    Log::info('Word rejected due to high similarity', [
                        'candidate' => $candidate,
                        'existing' => $existing,
                        'similarity' => $similarity
                    ]);
                    return false; // Too similar, don't add
                }
            }
            
            Log::info('Word passed similarity check', [
                'candidate' => $candidate
            ]);
            return true; // Unique enough to add
            
        } catch (\Exception $e) {
            Log::error('Error in english similarity check', [
                'candidate' => $candidate,
                'error' => $e->getMessage()
            ]);
            return true; // If error occurs, allow the word to be added
        }
    }

    /**
     * Calculate cosine similarity between two vectors
     */
    private function calculateCosineSimilarity(array $vectorA, array $vectorB): float
    {
        if (count($vectorA) !== count($vectorB)) {
            return 0.0;
        }

        $dotProduct = 0.0;
        $normA = 0.0;
        $normB = 0.0;

        for ($i = 0; $i < count($vectorA); $i++) {
            $dotProduct += $vectorA[$i] * $vectorB[$i];
            $normA += $vectorA[$i] * $vectorA[$i];
            $normB += $vectorB[$i] * $vectorB[$i];
        }

        $normA = sqrt($normA);
        $normB = sqrt($normB);

        if ($normA == 0 || $normB == 0) {
            return 0.0;
        }

        return $dotProduct / ($normA * $normB);
    }

    /**
     * Set the similarity threshold
     */
    public function setSimilarityThreshold(float $threshold): void
    {
        $this->similarityThreshold = $threshold;
    }

    /**
     * Get the current similarity threshold
     */
    public function getSimilarityThreshold(): float
    {
        return $this->similarityThreshold;
    }
}
