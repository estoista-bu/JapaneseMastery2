<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TitleParserService
{
    private $ollamaUrl = 'http://localhost:11434/api/generate';
    private $model = 'qwen3:0.6b';

    /**
     * Parse deck title to extract JLPT levels and grammatical categories
     */
    public function parseTitle($deckTitle)
    {
        try {
            $prompt = $this->buildPrompt($deckTitle);
            
            $response = Http::timeout(600)->post($this->ollamaUrl, [
                'model' => $this->model,
                'prompt' => $prompt,
                'stream' => false,
                'options' => [
                    'temperature' => 0.1, // Low temperature for consistent JSON output
                    'top_p' => 0.9
                ]
            ]);

            if ($response->ok()) {
                $responseData = $response->json();
                $content = $responseData['response'] ?? '';
                
                Log::info('Title parser AI response', [
                    'title' => $deckTitle,
                    'response' => $content
                ]);

                return $this->parseJsonResponse($content);
            } else {
                Log::error('Title parser API failed', [
                    'title' => $deckTitle,
                    'status' => $response->status(),
                    'response' => $response->body()
                ]);
                return null;
            }

        } catch (\Exception $e) {
            Log::error('Title parser exception', [
                'title' => $deckTitle,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Build the prompt for the AI
     */
    private function buildPrompt($deckTitle)
    {
        return <<<PROMPT
You are a Japanese deck title parser. Parse the title and extract:

1. JLPT levels mentioned (N1, N2, N3, N4, N5)
2. Grammatical categories (verb, noun, counter, adjective, adverb, particle, etc.)
3. Remaining words after removing JLPT levels and grammatical terms

Examples:
- "JLPT N4, N5 Verbs" → {"levels": ["N4", "N5"], "categories": ["verb"], "words_left": []}
- "VERBS jlpt n5" → {"levels": ["N5"], "categories": ["verb"], "words_left": []}
- "Food nouns N2" → {"levels": ["N2"], "categories": ["noun"], "words_left": ["food"]}
- "N1 Particles" → {"levels": ["N1"], "categories": ["particle"], "words_left": []}
- "Counters N4" → {"levels": ["N4"], "categories": ["counter"], "words_left": []}
- "Beach vocabulary" → {"levels": [], "categories": [], "words_left": ["beach"]}
- "Romantic phrases" → {"levels": [], "categories": [], "words_left": ["romantic"]}
- "Weather words" → {"levels": [], "categories": [], "words_left": ["weather"]}
- "Kitchen utensils N3" → {"levels": ["N3"], "categories": [], "words_left": ["kitchen", "utensils"]}

IMPORTANT: Always use uppercase for JLPT levels (N1, N2, N3, N4, N5), not lowercase (n1, n2, etc.).

IMPORTANT: Return ONLY the JSON response. Do not include any explanations, thinking, or other text.

Return JSON only:
{"levels": [...], "categories": [...], "words_left": [...]}

Title: "{$deckTitle}"

PROMPT;
    }

    /**
     * Parse the JSON response from AI
     */
    private function parseJsonResponse($content)
    {
        // Clean the response - remove any non-JSON text including <think> tags
        $content = preg_replace('/<think>.*?<\/think>/s', '', $content);
        $content = trim($content);
        
        $jsonStart = strpos($content, '{');
        $jsonEnd = strrpos($content, '}');
        
        if ($jsonStart === false || $jsonEnd === false) {
            Log::warning('No JSON found in AI response', ['content' => $content]);
            return null;
        }
        
        $jsonString = substr($content, $jsonStart, $jsonEnd - $jsonStart + 1);
        
        try {
            $parsed = json_decode($jsonString, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::warning('JSON decode error', [
                    'error' => json_last_error_msg(),
                    'json' => $jsonString
                ]);
                return null;
            }
            
            // Validate structure
            if (!isset($parsed['levels']) || !isset($parsed['categories']) || !isset($parsed['words_left'])) {
                Log::warning('Invalid JSON structure', ['parsed' => $parsed]);
                return null;
            }
            
            // Ensure arrays
            $parsed['levels'] = is_array($parsed['levels']) ? $parsed['levels'] : [];
            $parsed['categories'] = is_array($parsed['categories']) ? $parsed['categories'] : [];
            $parsed['words_left'] = is_array($parsed['words_left']) ? $parsed['words_left'] : [];
            
            return $parsed;
            
        } catch (\Exception $e) {
            Log::error('JSON parsing exception', [
                'error' => $e->getMessage(),
                'json' => $jsonString
            ]);
            return null;
        }
    }

    /**
     * Test the parser with sample titles
     */
    public function testParser()
    {
        $testTitles = [
            'JLPT N4, N5 Verbs',
            'N3 Adjectives',
            'Beach vocabulary',
            'VERBS jlpt n5',
            'Romantic phrases',
            'Food nouns N2'
        ];

        foreach ($testTitles as $title) {
            $result = $this->parseTitle($title);
            echo "Title: {$title}\n";
            echo "Result: " . json_encode($result, JSON_PRETTY_PRINT) . "\n\n";
        }
    }
}
