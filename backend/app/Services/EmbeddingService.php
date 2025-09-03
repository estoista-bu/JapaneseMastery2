<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use App\Models\Word;
use Illuminate\Support\Facades\Log;

class EmbeddingService
{
    private $ollamaUrl = 'http://localhost:11434/api/embed';
    private $model = 'nomic-embed-text';

    /**
     * Generate embeddings for all words that don't have them
     */
    public function generateEmbeddings()
    {
        $words = Word::whereNull('embedding')->get();
        $total = $words->count();
        $processed = 0;
        $failed = 0;

        Log::info("Starting embedding generation for {$total} words");

        foreach ($words as $word) {
            try {
                // Use Japanese text for embedding (more semantic meaning)
                $text = $word->japanese . ' ' . $word->reading . ' ' . $word->english;
                
                $response = Http::timeout(600)->post($this->ollamaUrl, [
                    'model' => $this->model,
                    'input' => $text
                ]);

                if ($response->ok()) {
                    $responseData = $response->json();
                    
                    // Check for embedding key (try both singular and plural)
                    if (isset($responseData['embedding'])) {
                        $embedding = $responseData['embedding'];
                    } elseif (isset($responseData['embeddings'])) {
                        $embedding = $responseData['embeddings'][0];
                    } else {
                        $failed++;
                        Log::error("❌ No embedding key found for: {$word->japanese}", [
                            'response' => $responseData
                        ]);
                        continue;
                    }
                    
                    // Save to DB as JSON
                    $word->embedding = $embedding;
                    $word->save();
                    
                    $processed++;
                    Log::info("✅ Embedded: {$word->japanese} ({$processed}/{$total})");
                } else {
                    $failed++;
                    Log::error("❌ Failed for: {$word->japanese} - HTTP {$response->status()}");
                }

                // Add small delay to prevent overwhelming the API
                usleep(100000); // 0.1 second

            } catch (\Exception $e) {
                $failed++;
                Log::error("❌ Exception for: {$word->japanese} - {$e->getMessage()}");
            }
        }

        Log::info("Embedding generation complete: {$processed} processed, {$failed} failed");
        
        return [
            'total' => $total,
            'processed' => $processed,
            'failed' => $failed
        ];
    }

    /**
     * Generate embedding for a single word
     */
    public function generateEmbeddingForWord(Word $word)
    {
        try {
            $text = $word->japanese . ' ' . $word->reading . ' ' . $word->english;
            
            $response = Http::timeout(120)->post($this->ollamaUrl, [
                'model' => $this->model,
                'input' => $text
            ]);

            if ($response->ok()) {
                $responseData = $response->json();
                
                // Check for embedding key (try both singular and plural)
                if (isset($responseData['embedding'])) {
                    $embedding = $responseData['embedding'];
                } elseif (isset($responseData['embeddings'])) {
                    $embedding = $responseData['embeddings'][0];
                } else {
                    Log::error("❌ No embedding key found for: {$word->japanese}", [
                        'response' => $responseData
                    ]);
                    return false;
                }
                
                $word->embedding = $embedding;
                $word->save();
                
                Log::info("✅ Generated embedding for: {$word->japanese}");
                return true;
            } else {
                Log::error("❌ Failed to generate embedding for: {$word->japanese} - HTTP {$response->status()}");
                return false;
            }

        } catch (\Exception $e) {
            Log::error("❌ Exception generating embedding for: {$word->japanese} - {$e->getMessage()}");
            return false;
        }
    }

    /**
     * Get embedding for a search query
     */
    public function getQueryEmbedding($query)
    {
        try {
            $response = Http::timeout(600)->post($this->ollamaUrl, [
                'model' => $this->model,
                'input' => $query
            ]);

            if ($response->ok()) {
                $responseData = $response->json();
                
                // Log the response structure for debugging
                Log::info("Embedding API response structure", [
                    'keys' => array_keys($responseData),
                    'response' => $responseData
                ]);
                
                // Check if embedding key exists (try both singular and plural)
                if (isset($responseData['embedding'])) {
                    return $responseData['embedding'];
                } elseif (isset($responseData['embeddings'])) {
                    // Ollama returns embeddings as array, take the first one
                    return $responseData['embeddings'][0];
                } else {
                    Log::error("❌ No 'embedding' or 'embeddings' key in response for: {$query}", [
                        'response' => $responseData
                    ]);
                    return null;
                }
            } else {
                Log::error("❌ Failed to get query embedding for: {$query} - HTTP {$response->status()}", [
                    'response' => $response->body()
                ]);
                return null;
            }

        } catch (\Exception $e) {
            Log::error("❌ Exception getting query embedding for: {$query} - {$e->getMessage()}");
            return null;
        }
    }

    /**
     * Calculate cosine similarity between two vectors
     */
    private function cosineSimilarity($vectorA, $vectorB)
    {
        $dotProduct = array_sum(array_map(fn($a, $b) => $a * $b, $vectorA, $vectorB));
        $normA = sqrt(array_sum(array_map(fn($a) => $a * $a, $vectorA)));
        $normB = sqrt(array_sum(array_map(fn($b) => $b * $b, $vectorB)));
        
        if ($normA == 0 || $normB == 0) {
            return 0;
        }
        
        return $dotProduct / ($normA * $normB);
    }

    /**
     * Search words semantically using embeddings
     */
    public function searchSemantic($query, $limit = 10)
    {
        // Get embedding for the search term
        $queryVector = $this->getQueryEmbedding($query);
        
        if (!$queryVector) {
            Log::error("Could not generate embedding for query: {$query}");
            return collect();
        }

        Log::info("Searching with query vector length: " . count($queryVector));

        // Fetch all words with embeddings and compute similarity
        $words = Word::whereNotNull('embedding')->get();
        Log::info("Found {$words->count()} words with embeddings");
        
        $processedWords = $words->map(function ($word) use ($queryVector) {
            $embedding = $word->embedding;
            
            // Handle JSON string embeddings
            if (is_string($embedding)) {
                $embedding = json_decode($embedding, true);
                if ($embedding === null) {
                    Log::warning("Word {$word->japanese} has invalid JSON embedding");
                    return null;
                }
            }
            
            if (!$embedding || !is_array($embedding)) {
                Log::warning("Word {$word->japanese} has invalid embedding format");
                return null;
            }

            if (count($embedding) !== count($queryVector)) {
                Log::warning("Word {$word->japanese} embedding length mismatch: " . count($embedding) . " vs " . count($queryVector));
                return null;
            }

            $similarity = $this->cosineSimilarity($embedding, $queryVector);
            $word->similarity = $similarity;
            
            return $word;
        })->filter()->sortByDesc('similarity');

        Log::info("Processed words count: " . $processedWords->count());
        
        return $processedWords->take($limit)->values();
    }
}
