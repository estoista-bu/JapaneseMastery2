<?php

namespace App\Http\Controllers;

use App\Models\Deck;
use App\Models\Word;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Services\EmbeddingService;
use App\Services\WordUniquenessService;

class JlptController extends Controller
{
    /**
     * Get all decks
     */
    public function getDecks(): JsonResponse
    {
        $user = auth()->user();
        
        // Debug logging
        \Log::info('getDecks called', [
            'user' => $user ? $user->id : 'not authenticated',
            'user_username' => $user ? $user->username : 'not authenticated'
        ]);
        
        // Get admin, kana, and jlpt decks (system decks) - don't load words for performance
        $systemDecks = Deck::active()
            ->whereIn('category', ['admin', 'kana', 'jlpt'])
            ->withCount('words') // Only get word count, not actual words
            ->orderBy('jlpt_level')
            ->orderBy('name')
            ->get();

        // Get user-specific decks if user is authenticated - don't load words for performance
        $userDecks = collect();
        if ($user) {
            $userDecks = Deck::active()
                ->where('category', 'user')
                ->byUser($user->id)
                ->withCount('words') // Only get word count, not actual words
                ->orderBy('name')
                ->get();
        }

        // Combine system decks and user decks
        $allDecks = $systemDecks->concat($userDecks);
        
        \Log::info('getDecks response', [
            'system_decks_count' => $systemDecks->count(),
            'user_decks_count' => $userDecks->count(),
            'total_decks_count' => $allDecks->count(),
            'user_deck_names' => $userDecks->pluck('name')->toArray()
        ]);

        return response()->json([
            'decks' => $allDecks
        ]);
    }

    /**
     * Get a specific deck with its words
     */
    public function getDeck(string $slug): JsonResponse
    {
        $deck = Deck::where('slug', $slug)
            ->with('words')
            ->first();

        if (!$deck) {
            return response()->json([
                'message' => 'Deck not found'
            ], 404);
        }

        return response()->json([
            'deck' => $deck
        ]);
    }

    /**
     * Get all words
     */
    public function getWords(Request $request): JsonResponse
    {
        $query = Word::query();

        // Filter by JLPT level
        if ($request->has('jlpt_level')) {
            $query->byJlptLevel($request->jlpt_level);
        }

        // Search words
        if ($request->has('search')) {
            $query->search($request->search);
        }

        $words = $query->orderBy('japanese')->paginate(50);

        return response()->json([
            'words' => $words
        ]);
    }

    /**
     * Get a specific word
     */
    public function getWord(int $id): JsonResponse
    {
        $word = Word::with('decks')->find($id);

        if (!$word) {
            return response()->json([
                'message' => 'Word not found'
            ], 404);
        }

        return response()->json([
            'word' => $word
        ]);
    }

    /**
     * Search words
     */
    public function searchWords(Request $request): JsonResponse
    {
        $request->validate([
            'q' => 'required|string|min:1'
        ]);

        $words = Word::search($request->q)
            ->with('decks')
            ->limit(20)
            ->get();

        return response()->json([
            'words' => $words
        ]);
    }

    /**
     * Get words by JLPT level
     */
    public function getWordsByLevel(string $level): JsonResponse
    {
        $words = Word::byJlptLevel($level)
            ->with('decks')
            ->orderBy('japanese')
            ->get();

        return response()->json([
            'level' => $level,
            'words' => $words
        ]);
    }

    /**
     * AI-assisted selection of words from DB based on deck title using Ollama.
     * Randomly selects words and uses AI to check relevance to deck title.
     */
    public function selectWordsForDeck(Request $request): JsonResponse
    {
        // Set execution time limit to 10 minutes
        set_time_limit(600);
        
        try {
            \Log::info('selectWordsForDeck called', [
                'request_data' => $request->all(),
                'user_id' => auth()->id(),
                'deck_slug_received' => $request->input('deck_slug')
            ]);
        
        $request->validate([
            'deck_slug' => 'required|string',
            'deck_title' => 'required|string',
            'num' => 'required|integer|min:1|max:100',
        ]);

        $user = auth()->user();
        if (!$user) {
            return response()->json([
                'message' => 'User not authenticated'
            ], 401);
        }

        $deck = Deck::where('slug', $request->deck_slug)->first();
        if (!$deck) {
            \Log::warning('selectWordsForDeck: Deck not found', [
                'deck_slug' => $request->deck_slug,
                'available_slugs' => Deck::pluck('slug')->toArray()
            ]);
            return response()->json([
                'message' => 'Deck not found',
                'deck_slug' => $request->deck_slug
            ], 404);
        }

        // Only allow selection for user decks
        if ($deck->category !== 'user' || $deck->user_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized to select words for this deck'
            ], 403);
        }

        $numRequested = $request->num;
        $deckTitle = $request->deck_title;

        // Get existing word IDs in this deck to avoid duplicates
        $existingWordIds = $deck->words()->pluck('words.id')->toArray();

        // Build query for word selection
        $query = Word::query();
        
        // Apply JLPT level filter if deck has JLPT level
        if ($deck->jlpt_level) {
            $query->where('jlpt_level', $deck->jlpt_level);
        }

        // Exclude words already in the deck
        if (!empty($existingWordIds)) {
            $query->whereNotIn('id', $existingWordIds);
        }

        // Use semantic search to select relevant words
        $selectedWords = $this->selectWordsWithSemanticSearch($query, $deckTitle, $numRequested, $existingWordIds);
        
        // Calculate total available words with current constraints
        $totalAvailable = $this->getTotalAvailableWords($deck, $existingWordIds);
        
        \Log::info('selectWordsForDeck: Final results', [
            'words_picked' => count($selectedWords),
            'requested_num' => $numRequested,
            'total_available' => $totalAvailable,
            'exhausted' => count($selectedWords) < $numRequested,
            'constraints_exhausted' => $totalAvailable <= count($existingWordIds)
        ]);

        return response()->json([
            'words' => $selectedWords,
            'exhausted' => count($selectedWords) < $numRequested,
            'total_available' => $totalAvailable,
            'constraints_exhausted' => $totalAvailable <= count($existingWordIds),
            'thresholdUsed' => null,
        ], 200, [
            'Content-Type' => 'application/json; charset=utf-8'
        ], JSON_UNESCAPED_UNICODE);
        
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('selectWordsForDeck validation error', [
                'errors' => $e->errors(),
                'request_data' => $request->all()
            ]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('selectWordsForDeck error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);
            return response()->json([
                'message' => 'An error occurred while selecting words',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Use hybrid approach: AI parsing + database filtering, with semantic search fallback
     */
    private function selectWordsWithSemanticSearch($query, $deckTitle, $numRequested, $existingWordIds)
    {
        // Set execution time limit to 10 minutes for semantic search
        set_time_limit(600);
        
        $selectedWords = [];
        $embeddingService = new EmbeddingService();
        $titleParser = new \App\Services\TitleParserService();
        
        \Log::info('selectWordsWithSemanticSearch: Starting hybrid search', [
            'deck_title' => $deckTitle,
            'num_requested' => $numRequested
        ]);

        // Step 1: Try AI parsing first
        $parsed = $titleParser->parseTitle($deckTitle);
        
                   if ($parsed && (!empty($parsed['levels']) || !empty($parsed['categories']))) {
               \Log::info('selectWordsWithSemanticSearch: AI parsing successful', [
                   'parsed' => $parsed
               ]);
               
               // Use AI parsing + database filtering
               $selectedWords = $this->selectWordsWithAIParsing($query, $parsed, $numRequested, $existingWordIds);
               
               if (count($selectedWords) >= $numRequested) {
                   \Log::info('selectWordsWithSemanticSearch: AI parsing provided sufficient results', [
                       'selected' => count($selectedWords)
                   ]);
                   return $selectedWords;
               }
               
               // If AI parsing didn't provide enough results, try semantic search with words_left
               if (!empty($parsed['words_left'])) {
                   \Log::info('selectWordsWithSemanticSearch: AI parsing insufficient, trying semantic search with words_left', [
                       'words_left' => $parsed['words_left']
                   ]);
                   
                   $semanticQuery = implode(' ', $parsed['words_left']);
                   $semanticWords = $embeddingService->searchSemantic($semanticQuery, $numRequested * 5);
                   
                   // Shuffle semantic results for better randomization
                   shuffle($semanticWords);
                   
                   // Filter out words already selected and already in deck
                   foreach ($semanticWords as $word) {
                       if (count($selectedWords) >= $numRequested) break;
                       
                       $wordId = $word['id'] ?? null;
                       if ($wordId && !in_array($wordId, $existingWordIds)) {
                           $wordData = [
                               'japanese' => $word['japanese'],
                               'reading' => $word['reading'],
                               'english' => $word['english'],
                               'jlpt_level' => $word['jlpt_level'] ?? null,
                               'part_of_speech' => $word['part_of_speech'] ?? null,
                               'method' => 'ai_parsing_semantic_fallback'
                           ];
                           
                           $selectedWords[] = $wordData;
                       }
                   }
                   
                   if (count($selectedWords) >= $numRequested) {
                       \Log::info('selectWordsWithSemanticSearch: AI + semantic fallback provided sufficient results', [
                           'selected' => count($selectedWords)
                       ]);
                       return $selectedWords;
                   }
               }
           }

        // Step 2: Fallback to semantic search
        \Log::info('selectWordsWithSemanticSearch: Falling back to semantic search');
        
        // Create search query based on deck title
        $searchQuery = $this->createSearchQueryFromDeckTitle($deckTitle);
        
        \Log::info('selectWordsWithSemanticSearch: Search query created', [
            'search_query' => $searchQuery
        ]);

        try {
            // Get semantically similar words with more variety
            $semanticResults = $embeddingService->searchSemantic($searchQuery, $numRequested * 5);
            
            \Log::info('selectWordsWithSemanticSearch: Semantic search results', [
                'results_count' => $semanticResults->count(),
                'top_results' => $semanticResults->take(5)->map(function($word) {
                    return [
                        'japanese' => $word->japanese,
                        'english' => $word->english,
                        'similarity' => round($word->similarity, 4)
                    ];
                })->toArray()
            ]);

            // Apply JLPT level filter if specified
            $jlptLevel = $this->extractJlptLevelFromTitle($deckTitle);
            if ($jlptLevel) {
                $semanticResults = $semanticResults->filter(function($word) use ($jlptLevel) {
                    return $word->jlpt_level === $jlptLevel;
                });
            }

            // Apply part-of-speech filter if specified
            $partOfSpeech = $this->extractPartOfSpeechFromTitle($deckTitle);
            if ($partOfSpeech) {
                $semanticResults = $semanticResults->filter(function($word) use ($partOfSpeech) {
                    return $word->part_of_speech === $partOfSpeech;
                });
            }

            // Shuffle semantic results for better randomization
            $shuffledResults = $semanticResults->shuffle();
            
            // Convert to array format and add to selected words
            $wordsToTake = min($numRequested, $shuffledResults->count());
            
            foreach ($shuffledResults as $word) {
                if (count($selectedWords) >= $wordsToTake) break;
                
                // Check if word is already in deck
                $alreadyInDeck = in_array($word->id, $existingWordIds);
                if ($alreadyInDeck) continue;
                
                $wordData = [
                    'japanese' => $word->japanese,
                    'reading' => $word->reading,
                    'english' => $word->english,
                    'jlpt_level' => $word->jlpt_level,
                    'part_of_speech' => $word->part_of_speech,
                    'similarity' => $word->similarity,
                    'method' => 'semantic_search'
                ];
                
                $selectedWords[] = $wordData;
            }
            
            // Log if we couldn't provide all requested words
            if (count($selectedWords) < $numRequested) {
                \Log::info('selectWordsWithSemanticSearch: Insufficient words from semantic search', [
                    'requested' => $numRequested,
                    'provided' => count($selectedWords),
                    'search_query' => $searchQuery,
                    'jlpt_level' => $jlptLevel,
                    'part_of_speech' => $partOfSpeech
                ]);
            }

            \Log::info('selectWordsWithSemanticSearch: Final results', [
                'total_selected' => count($selectedWords),
                'requested' => $numRequested,
                'jlpt_filter' => $jlptLevel,
                'pos_filter' => $partOfSpeech
            ]);

        } catch (\Exception $e) {
            \Log::error('selectWordsWithSemanticSearch: Semantic search failed', [
                'error' => $e->getMessage(),
                'deck_title' => $deckTitle
            ]);
            
            // Fallback to random selection
            $selectedWords = $this->fallbackToRandomSelection($query, $numRequested, $existingWordIds);
        }

        return $selectedWords;
    }

    /**
     * Select words using AI parsing + database filtering
     */
    private function selectWordsWithAIParsing($query, $parsed, $numRequested, $existingWordIds)
    {
        $selectedWords = [];
        
        try {
            // Build query with AI parsing results
            $wordQuery = \App\Models\Word::query();
            
            // Apply JLPT level filter
            if (!empty($parsed['levels'])) {
                // Normalize JLPT levels to uppercase
                $normalizedLevels = array_map(function($level) {
                    return strtoupper(trim($level));
                }, $parsed['levels']);
                
                $wordQuery->whereIn('jlpt_level', $normalizedLevels);
                
                \Log::info('selectWordsWithAIParsing: JLPT filter applied', [
                    'original_levels' => $parsed['levels'],
                    'normalized_levels' => $normalizedLevels
                ]);
            }
            
            // Apply part of speech filter
            if (!empty($parsed['categories'])) {
                $wordQuery->whereIn('part_of_speech', $parsed['categories']);
            }
            
            // Exclude words already in deck
            if (!empty($existingWordIds)) {
                $wordQuery->whereNotIn('id', $existingWordIds);
            }
            
            // Get more random words to increase variety (5x the requested amount for better randomization)
            // Add random offset to ensure different results each time
            $totalAvailable = $wordQuery->count();
            $limit = min($numRequested * 5, $totalAvailable);
            $maxOffset = max(0, $totalAvailable - $limit);
            $randomOffset = $maxOffset > 0 ? rand(0, $maxOffset) : 0;
            
            $words = $wordQuery->inRandomOrder()->offset($randomOffset)->limit($limit)->get();
            
            \Log::info('selectWordsWithAIParsing: Database query results', [
                'levels' => $parsed['levels'] ?? [],
                'categories' => $parsed['categories'] ?? [],
                'total_available' => $totalAvailable,
                'limit' => $limit,
                'random_offset' => $randomOffset,
                'found_words' => $words->count(),
                'requested' => $numRequested
            ]);
            
            // Shuffle the words again for extra randomization
            $shuffledWords = $words->shuffle();
            
            // Convert to array format - take all available words if we don't have enough
            $wordsToTake = min($numRequested, $shuffledWords->count());
            
            foreach ($shuffledWords as $word) {
                if (count($selectedWords) >= $wordsToTake) break;
                
                $wordData = [
                    'japanese' => $word->japanese,
                    'reading' => $word->reading,
                    'english' => $word->english,
                    'jlpt_level' => $word->jlpt_level,
                    'part_of_speech' => $word->part_of_speech,
                    'method' => 'ai_parsing'
                ];
                
                $selectedWords[] = $wordData;
            }
            
            // Log if we couldn't provide all requested words
            if (count($selectedWords) < $numRequested) {
                \Log::info('selectWordsWithAIParsing: Insufficient words available', [
                    'requested' => $numRequested,
                    'provided' => count($selectedWords),
                    'total_available' => $totalAvailable,
                    'constraints' => [
                        'levels' => $parsed['levels'] ?? [],
                        'categories' => $parsed['categories'] ?? []
                    ]
                ]);
            }
            
        } catch (\Exception $e) {
            \Log::error('selectWordsWithAIParsing: Failed', [
                'error' => $e->getMessage(),
                'parsed' => $parsed
            ]);
        }
        
        return $selectedWords;
    }

    /**
     * Get total available words with current deck constraints
     */
    private function getTotalAvailableWords($deck, $existingWordIds)
    {
        try {
            $query = Word::query();
            
            // Apply JLPT level filter if deck has JLPT level
            if ($deck->jlpt_level) {
                $query->where('jlpt_level', $deck->jlpt_level);
            }
            
            // Apply part of speech filter if deck title suggests it
            $partOfSpeech = $this->extractPartOfSpeechFromTitle($deck->title);
            if ($partOfSpeech) {
                $query->where('part_of_speech', $partOfSpeech);
            }
            
            // Exclude words already in the deck
            if (!empty($existingWordIds)) {
                $query->whereNotIn('id', $existingWordIds);
            }
            
            $total = $query->count();
            
            \Log::info('getTotalAvailableWords: Calculated total', [
                'deck_title' => $deck->title,
                'jlpt_level' => $deck->jlpt_level,
                'part_of_speech' => $partOfSpeech,
                'existing_words' => count($existingWordIds),
                'total_available' => $total
            ]);
            
            return $total;
            
        } catch (\Exception $e) {
            \Log::error('getTotalAvailableWords: Error calculating total', [
                'error' => $e->getMessage()
            ]);
            return 0;
        }
    }

    /**
     * Create search query from deck title
     */
    private function createSearchQueryFromDeckTitle($deckTitle)
    {
        $title = strtolower($deckTitle);
        
        // Handle grammatical categories with better semantic queries
        if (in_array($title, ['verbs', 'verb', '動詞'])) {
            return 'action words doing things';
        }
        if (in_array($title, ['nouns', 'noun', '名詞'])) {
            return 'things objects people places';
        }
        if (in_array($title, ['adjectives', 'adjective', '形容詞'])) {
            return 'describing words qualities characteristics';
        }
        if (in_array($title, ['adverbs', 'adverb', '副詞'])) {
            return 'how when where words';
        }
        
        // Try AI parsing first to get words_left
        $titleParser = new \App\Services\TitleParserService();
        $parsed = $titleParser->parseTitle($deckTitle);
        
        if ($parsed && !empty($parsed['words_left'])) {
            // Use the words_left from AI parsing
            return implode(' ', $parsed['words_left']);
        }
        
        // Fallback to manual extraction
        $topic = $this->extractTopicFromTitle($deckTitle);
        
        // Extract part of speech
        $partOfSpeech = $this->extractPartOfSpeechFromTitle($deckTitle);
        
        // Build search query
        $searchQuery = $topic;
        if ($partOfSpeech) {
            $searchQuery .= " " . $partOfSpeech;
        }
        
        return $searchQuery;
    }

    /**
     * Extract topic from deck title
     */
    private function extractTopicFromTitle($deckTitle)
    {
        $title = strtolower($deckTitle);
        
        // Common topics
        $topics = [
            'food', 'animals', 'colors', 'numbers', 'family', 
            'time', 'weather', 'body', 'clothes', 'transport',
            'house', 'school', 'work', 'hobbies', 'emotions',
            'beach', 'ocean', 'sea', 'water', 'nature', 'outdoor'
        ];
        
        foreach ($topics as $topic) {
            if (strpos($title, $topic) !== false) {
                return $topic;
            }
        }
        
        // If no specific topic found, use the title itself
        return $title;
    }

    /**
     * Extract JLPT level from deck title
     */
    private function extractJlptLevelFromTitle($deckTitle)
    {
        $title = strtoupper($deckTitle);
        
        if (strpos($title, 'N5') !== false) return 'N5';
        if (strpos($title, 'N4') !== false) return 'N4';
        if (strpos($title, 'N3') !== false) return 'N3';
        if (strpos($title, 'N2') !== false) return 'N2';
        if (strpos($title, 'N1') !== false) return 'N1';
        
        return null;
    }

    /**
     * Extract part of speech from deck title
     */
    private function extractPartOfSpeechFromTitle($deckTitle)
    {
        $title = strtolower($deckTitle);
        
        if (strpos($title, 'verb') !== false) return 'verb';
        if (strpos($title, 'noun') !== false) return 'noun';
        if (strpos($title, 'adjective') !== false) return 'adjective';
        if (strpos($title, 'adverb') !== false) return 'adverb';
        
        return null;
    }

    /**
     * Fallback to random selection if semantic search fails
     */
    private function fallbackToRandomSelection($query, $numRequested, $existingWordIds)
    {
        \Log::info('selectWordsWithSemanticSearch: Using fallback random selection');
        
        $selectedWords = [];
        $attempts = 0;
        $maxAttempts = 5;

        while (count($selectedWords) < $numRequested && $attempts < $maxAttempts) {
            $attempts++;
            
            // Get more candidates for better randomization
            $candidates = $query->inRandomOrder()->limit($numRequested * 5)->get();
            
            foreach ($candidates as $word) {
                if (count($selectedWords) >= $numRequested) break;
                
                // Check if word is already in deck
                $alreadyInDeck = in_array($word->id, $existingWordIds);
                if ($alreadyInDeck) continue;
                
                $wordData = [
                    'japanese' => $word->japanese,
                    'reading' => $word->reading,
                    'english' => $word->english,
                    'jlpt_level' => $word->jlpt_level,
                    'part_of_speech' => $word->part_of_speech,
                ];
                
                $selectedWords[] = $wordData;
            }
        }

        return $selectedWords;
    }

    /**
     * Call Ollama AI for word selection
     */
    private function callOllamaForWordSelection($prompt)
    {
        $url = 'http://localhost:11434/api/generate';
        
        // Test with a simpler prompt first to see if model is working
        $testRequestData = [
            'model' => 'qwen3:0.6b',
            'prompt' => 'Say "Hello"',
            'stream' => false,
        ];
        
        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($testRequestData),
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
            ],
            CURLOPT_TIMEOUT => 600,
            CURLOPT_CONNECTTIMEOUT => 5,
        ]);

        $testResponse = curl_exec($ch);
        $testHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        \Log::info('Ollama test response', [
            'test_http_code' => $testHttpCode,
            'test_response' => substr($testResponse, 0, 200)
        ]);
        
        $requestData = [
            'model' => 'qwen3:0.6b',
            'prompt' => $prompt,
            'stream' => false,
            'temperature' => 0.1, // Lower temperature for more focused classification
            'top_p' => 0.9,
            'num_predict' => 2048, // Limit response length
        ];

        $ch = curl_init();
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($requestData),
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
            ],
            CURLOPT_TIMEOUT => 600, // 10 minutes for AI processing
            CURLOPT_CONNECTTIMEOUT => 5,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            throw new \Exception('Ollama connection error: ' . $error);
        }

        if ($httpCode !== 200) {
            \Log::error('Ollama API error', [
                'http_code' => $httpCode,
                'response' => substr($response, 0, 1000),
                'request_data' => $requestData,
                'curl_error' => $error
            ]);
            throw new \Exception('Ollama API returned HTTP ' . $httpCode . ': ' . substr($response, 0, 200));
        }

        $data = json_decode($response, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception('Invalid JSON response from Ollama API');
        }

        if (!isset($data['response'])) {
            \Log::error('Unexpected Ollama API response structure', ['response' => $data]);
            throw new \Exception('Unexpected response structure from Ollama API');
        }

        $generatedText = $data['response'];
        
        // Parse the JSON response from the AI
        $cleanedText = trim($generatedText);
        
        // Remove <think> tags that AI might include
        $cleanedText = preg_replace('/<think>.*?<\/think>/s', '', $cleanedText);
        
        if (str_starts_with($cleanedText, '```json')) {
            $cleanedText = preg_replace('/^```json\s*/', '', $cleanedText);
            $cleanedText = preg_replace('/\s*```$/', '', $cleanedText);
        }

        $selectedWords = json_decode($cleanedText, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            \Log::error('AI returned invalid JSON', [
                'generated_text' => $generatedText,
                'cleaned_text' => $cleanedText,
                'json_error' => json_last_error_msg()
            ]);
            throw new \Exception('AI returned invalid JSON: ' . json_last_error_msg());
        }

        if (!is_array($selectedWords)) {
            throw new \Exception('AI did not return an array of words');
        }

        return $selectedWords;
    }

    /**
     * Add word to deck with duplicate prevention
     */
    public function addWordToDeck(Request $request): JsonResponse
    {
        \Log::info('addWordToDeck called', [
            'request_data' => $request->all(),
            'user_id' => auth()->id()
        ]);

        try {
            $request->validate([
                'deck_slug' => 'required|string|exists:decks,slug',
                'japanese' => 'required|string',
                'reading' => 'nullable|string',
                'english' => 'required|string',
                'jlpt_level' => 'nullable|string|in:N1,N2,N3,N4,N5',
                'part_of_speech' => 'nullable|string',
                'example_sentence' => 'nullable|string',
            ]);

            $user = auth()->user();
            if (!$user) {
                \Log::error('addWordToDeck: User not authenticated');
                return response()->json([
                    'message' => 'User not authenticated'
                ], 401);
            }

            $deck = Deck::where('slug', $request->deck_slug)->first();
            
            if (!$deck) {
                return response()->json([
                    'message' => 'Deck not found'
                ], 404);
            }

            // System decks (admin, kana, jlpt) cannot have words added to them
            if (in_array($deck->category, ['admin', 'kana', 'jlpt'])) {
                return response()->json([
                    'message' => 'Cannot add words to system decks'
                ], 403);
            }

            // Check if user owns this deck (for user decks)
            if ($deck->category === 'user' && $deck->user_id !== $user->id) {
                return response()->json([
                    'message' => 'Unauthorized to add words to this deck'
                ], 403);
            }

            // Prepare word data for uniqueness check
            $wordData = [
                'japanese' => $request->japanese,
                'reading' => $request->reading,
                'meaning' => $request->english,
                'jlpt_level' => $request->jlpt_level,
                'part_of_speech' => $request->part_of_speech,
                'example_sentence' => $request->example_sentence,
            ];

            // Check if word already exists with same writing, reading, and meaning (exact duplicate)
            $existingWord = Word::where('japanese', $request->japanese)
                ->where('reading', $request->reading)
                ->where('english', $request->english)
                ->first();

            if ($existingWord) {
                // Exact duplicate exists, just create the relationship if it doesn't exist
                $deck->words()->syncWithoutDetaching([$existingWord->id]);
                
                return response()->json([
                    'message' => 'Word already exists and added to deck',
                    'word' => $existingWord,
                    'action' => 'linked_existing'
                ]);
            }

            // Use uniqueness service to check if word should be added
            $uniquenessService = new WordUniquenessService(new EmbeddingService());
            
            if (!$uniquenessService->isWordUnique($wordData)) {
                return response()->json([
                    'message' => 'Word is too similar to existing words and cannot be added',
                    'action' => 'similarity_rejected'
                ], 422);
            }

            // Create new word
            $word = Word::create([
                'japanese' => $request->japanese,
                'reading' => $request->reading,
                'english' => $request->english,
                'jlpt_level' => $request->jlpt_level,
                'part_of_speech' => $request->part_of_speech,
                'example_sentence' => $request->example_sentence,
            ]);
            
            $action = 'created_new';

            // Add word to deck
            $deck->words()->attach($word->id);

            // Update deck word count
            $deck->updateWordCount();

            $message = 'Word created and added to deck';
                
            return response()->json([
                'message' => $message,
                'word' => $word,
                'action' => $action
            ], 201);
        } catch (\Exception $e) {
            \Log::error('addWordToDeck error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Remove word from deck
     */
    public function removeWordFromDeck(Request $request): JsonResponse
    {
        $request->validate([
            'deck_slug' => 'required|string|exists:decks,slug',
            'word_id' => 'required|integer|exists:words,id',
        ]);

        $user = auth()->user();
        if (!$user) {
            return response()->json([
                'message' => 'User not authenticated'
            ], 401);
        }

        $deck = Deck::where('slug', $request->deck_slug)->first();
        
        if (!$deck) {
            return response()->json([
                'message' => 'Deck not found'
            ], 404);
        }

        // Check if user owns this deck or if it's a system deck
        if ($deck->category === 'user' && $deck->user_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized to remove words from this deck'
            ], 403);
        }

        // System decks (admin, kana, jlpt) cannot have words removed from them
        if (in_array($deck->category, ['admin', 'kana', 'jlpt'])) {
            return response()->json([
                'message' => 'Cannot remove words from system decks'
            ], 403);
        }

        // Remove word from deck (but don't delete the word itself)
        $deck->words()->detach($request->word_id);

        // Update deck word count
        $deck->updateWordCount();

        // Check if word is orphaned and delete it if so
        $this->deleteOrphanedWord($request->word_id);

        return response()->json([
            'message' => 'Word removed from deck'
        ]);
    }

    /**
     * Update a word
     */
    public function updateWord(Request $request, int $wordId): JsonResponse
    {
        $request->validate([
            'japanese' => 'sometimes|required|string',
            'reading' => 'nullable|string',
            'english' => 'sometimes|required|string',
            'jlpt_level' => 'nullable|string|in:N1,N2,N3,N4,N5',
            'part_of_speech' => 'nullable|string',
            'example_sentence' => 'nullable|string',
        ]);

        $user = auth()->user();
        if (!$user) {
            return response()->json([
                'message' => 'User not authenticated'
            ], 401);
        }

        $word = Word::find($wordId);
        
        if (!$word) {
            return response()->json([
                'message' => 'Word not found'
            ], 404);
        }

        // Check if user owns any of the decks that contain this word
        $userDecks = $word->decks()->where('category', 'user')->where('user_id', $user->id)->get();
        
        if ($userDecks->isEmpty()) {
            return response()->json([
                'message' => 'Unauthorized to update this word'
            ], 403);
        }

        // Update the word
        $word->update($request->only([
            'japanese', 'reading', 'english', 'jlpt_level', 'part_of_speech', 'example_sentence'
        ]));

        return response()->json([
            'message' => 'Word updated successfully',
            'word' => $word
        ]);
    }

    /**
     * Delete word if it has no deck relationships
     */
    private function deleteOrphanedWord(int $wordId): void
    {
        $word = Word::find($wordId);
        
        if (!$word) {
            return;
        }

        // Check if word has any deck relationships
        $deckCount = $word->decks()->count();
        
        if ($deckCount === 0) {
            // Word is orphaned, delete it
            $word->delete();
        }
    }

    /**
     * Create a new custom deck
     */
    public function createDeck(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|in:user,kana,group,jlpt',
            'jlpt_level' => 'nullable|string|in:N1,N2,N3,N4,N5',
            'is_active' => 'boolean',
        ]);

        $user = auth()->user();
        if (!$user) {
            return response()->json([
                'message' => 'User not authenticated'
            ], 401);
        }

        // Generate slug from name
        $slug = \Illuminate\Support\Str::slug($request->name);
        
        // Ensure slug is unique for this user
        $counter = 1;
        $originalSlug = $slug;
        while (Deck::where('slug', $slug)->where('user_id', $user->id)->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        $deck = Deck::create([
            'name' => $request->name,
            'slug' => $slug,
            'description' => $request->description,
            'category' => $request->category ?? 'user', // Default to 'user' if not provided
            'jlpt_level' => $request->jlpt_level,
            'is_active' => $request->get('is_active', true),
            'word_count' => 0,
            'user_id' => $user->id,
        ]);

        return response()->json([
            'message' => 'Deck created successfully',
            'deck' => $deck
        ], 201);
    }

    /**
     * Update an existing deck
     */
    public function updateDeck(Request $request, string $slug): JsonResponse
    {
        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'sometimes|required|string|in:user,kana,group,jlpt',
            'jlpt_level' => 'nullable|string|in:N1,N2,N3,N4,N5',
            'is_active' => 'boolean',
        ]);

        $user = auth()->user();
        if (!$user) {
            return response()->json([
                'message' => 'User not authenticated'
            ], 401);
        }

        $deck = Deck::where('slug', $slug)->first();
        
        if (!$deck) {
            return response()->json([
                'message' => 'Deck not found'
            ], 404);
        }

        // Check if user owns this deck or if it's a system deck
        if ($deck->category === 'user' && $deck->user_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized to modify this deck'
            ], 403);
        }

        // Prepare update data
        $updateData = $request->only([
            'name', 'description', 'category', 'jlpt_level', 'is_active'
        ]);

        // If the name has changed, generate a new slug
        if (isset($updateData['name']) && $deck->name !== $updateData['name']) {
            $updateData['slug'] = Deck::generateUniqueSlug($updateData['name']);
        }

        // Update fields
        $deck->update($updateData);

        return response()->json([
            'message' => 'Deck updated successfully',
            'deck' => $deck
        ]);
    }

    /**
     * Delete a deck
     */
    public function deleteDeck(string $slug): JsonResponse
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json([
                'message' => 'User not authenticated'
            ], 401);
        }

        $deck = Deck::where('slug', $slug)->first();
        
        if (!$deck) {
            return response()->json([
                'message' => 'Deck not found'
            ], 404);
        }

        // Check if user owns this deck or if it's a system deck
        if ($deck->category === 'user' && $deck->user_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized to delete this deck'
            ], 403);
        }

        // Get all words in this deck before deleting relationships
        $wordsInDeck = $deck->words()->get();
        
        // Delete all word relationships first
        $deck->words()->detach();
        
        // Delete the deck
        $deck->delete();

        // Check if any words became orphaned and delete them
        foreach ($wordsInDeck as $word) {
            $this->deleteOrphanedWord($word->id);
        }

        return response()->json([
            'message' => 'Deck deleted successfully'
        ]);
    }

    /**
     * Get decks by category
     */
    public function getDecksByCategory(string $category): JsonResponse
    {
        $decks = Deck::where('category', $category)
            ->active()
            ->with('words')
            ->orderBy('name')
            ->get();

        return response()->json([
            'category' => $category,
            'decks' => $decks
        ]);
    }

    /**
     * Search words semantically using embeddings
     */
    public function searchSemantic(Request $request, EmbeddingService $embeddingService): JsonResponse
    {
        $request->validate([
            'query' => 'required|string|max:255',
            'limit' => 'integer|min:1|max:50'
        ]);

        $query = $request->query;
        $limit = $request->get('limit', 10);

        try {
            $words = $embeddingService->searchSemantic($query, $limit);
            
            return response()->json([
                'query' => $query,
                'words' => $words,
                'count' => $words->count()
            ]);

        } catch (\Exception $e) {
            Log::error('Semantic search failed', [
                'query' => $query,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Search failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate embeddings for words (admin endpoint)
     */
    public function generateEmbeddings(Request $request, EmbeddingService $embeddingService): JsonResponse
    {
        $user = auth()->user();
        
        if (!$user || !$user->is_admin) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        try {
            $result = $embeddingService->generateEmbeddings();
            
            return response()->json([
                'message' => 'Embeddings generated successfully',
                'result' => $result
            ]);

        } catch (\Exception $e) {
            Log::error('Embedding generation failed', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'message' => 'Embedding generation failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 