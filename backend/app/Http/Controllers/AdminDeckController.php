<?php

namespace App\Http\Controllers;

use App\Models\Deck;
use App\Models\Word;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminDeckController extends Controller
{
    /**
     * Get all admin decks
     */
    public function getAllDecks(Request $request)
    {
        // Check if current user is admin
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $query = Deck::select('id', 'name', 'description', 'category', 'is_public', 'created_at', 'user_id')
            ->withCount('words')
            ->orderBy('created_at', 'desc');

        // If 'all' parameter is not set, only show admin decks
        if (!$request->has('all') || $request->get('all') !== 'true') {
            $query->where('category', 'admin');
        }

        $decks = $query->get();

        return response()->json([
            'decks' => $decks
        ]);
    }

    /**
     * Create a new admin deck
     */
    public function createDeck(Request $request)
    {
        // Check if current user is admin
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Log the incoming request data
        \Log::info('AdminDeckController createDeck - Request data:', $request->all());

        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'nullable|string|max:1000',
                'category' => 'nullable|string|max:100',
                'is_public' => 'required|boolean',
            ]);

            $deck = Deck::create([
                'name' => $request->name,
                'description' => $request->description,
                'category' => 'admin', // Always set to 'admin' for admin-created decks
                'is_public' => $request->is_public,
                'user_id' => auth()->id(), // Admin creating the deck
            ]);

            return response()->json([
                'message' => 'Deck created successfully',
                'deck' => $deck
            ], 201);
        } catch (\Exception $e) {
            \Log::error('AdminDeckController createDeck error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to create deck: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update an admin deck
     */
    public function updateDeck(Request $request, $deckId)
    {
        // Check if current user is admin
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $deck = Deck::find($deckId);
        if (!$deck) {
            return response()->json(['error' => 'Deck not found'], 404);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'category' => 'nullable|string|max:100',
            'is_public' => 'required|boolean',
        ]);

        // Check if name has changed and update slug accordingly
        $updateData = [
            'name' => $request->name,
            'description' => $request->description,
            'category' => 'admin', // Always keep as 'admin' for admin decks
            'is_public' => $request->is_public,
        ];

        // If the name has changed, generate a new slug
        if ($deck->name !== $request->name) {
            $updateData['slug'] = Deck::generateUniqueSlug($request->name);
        }

        $deck->update($updateData);

        return response()->json([
            'message' => 'Deck updated successfully',
            'deck' => $deck
        ]);
    }

    /**
     * Delete an admin deck
     */
    public function deleteDeck($deckId)
    {
        // Check if current user is admin
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $deck = Deck::find($deckId);
        if (!$deck) {
            return response()->json(['error' => 'Deck not found'], 404);
        }

        // Delete associated words first
        $deck->words()->delete();
        
        // Delete the deck
        $deck->delete();

        return response()->json([
            'message' => 'Deck deleted successfully'
        ]);
    }

    /**
     * Use hybrid approach: AI parsing + database filtering, with semantic search fallback
     */
    private function selectWordsWithSemanticSearch($query, $deckTitle, $numRequested, $existingWordIds)
    {
        // Set execution time limit to 10 minutes for semantic search
        set_time_limit(600);
        
        $selectedWords = [];
        $embeddingService = new \App\Services\EmbeddingService();
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
            
            // If words_left is empty but we have a clear topic, prioritize semantic search
            if (empty($parsed['words_left']) && !empty($parsed['categories'])) {
                \Log::info('selectWordsWithSemanticSearch: Single-word topic detected, prioritizing semantic search', [
                    'deck_title' => $deckTitle,
                    'categories' => $parsed['categories']
                ]);
                
                // Use semantic search with the deck title directly
                $semanticWords = $embeddingService->searchSemantic($deckTitle, $numRequested * 5);
                
                // Convert to array and shuffle semantic results for better randomization
                $semanticWordsArray = $semanticWords->toArray();
                shuffle($semanticWordsArray);
                
                // Filter out words already in deck and add to selection
                foreach ($semanticWordsArray as $word) {
                    if (count($selectedWords) >= $numRequested) break;
                    
                    $wordId = $word['id'] ?? null;
                    if ($wordId && !in_array($wordId, $existingWordIds)) {
                        $wordData = [
                            'japanese' => $word['japanese'],
                            'reading' => $word['reading'],
                            'english' => $word['english'],
                            'jlpt_level' => $word['jlpt_level'] ?? null,
                            'part_of_speech' => $word['part_of_speech'] ?? null,
                            'method' => 'semantic_search_priority'
                        ];
                        
                        $selectedWords[] = $wordData;
                    }
                }
                
                if (count($selectedWords) >= $numRequested) {
                    \Log::info('selectWordsWithSemanticSearch: Semantic search priority provided sufficient results', [
                        'selected' => count($selectedWords)
                    ]);
                    return $selectedWords;
                }
            }
            
            // If we have specific topics in words_left, prioritize semantic search
            if (!empty($parsed['words_left'])) {
                \Log::info('selectWordsWithSemanticSearch: Specific topics detected, prioritizing semantic search', [
                    'words_left' => $parsed['words_left']
                ]);
                
                $semanticQuery = implode(' ', $parsed['words_left']);
                $semanticWords = $embeddingService->searchSemantic($semanticQuery, $numRequested * 5);
                
                // Convert to array and shuffle semantic results for better randomization
                $semanticWordsArray = $semanticWords->toArray();
                shuffle($semanticWordsArray);
                
                // Filter out words already selected and already in deck
                foreach ($semanticWordsArray as $word) {
                    if (count($selectedWords) >= $numRequested) break;
                    
                    $wordId = $word['id'] ?? null;
                    if ($wordId && !in_array($wordId, $existingWordIds)) {
                        $wordData = [
                            'japanese' => $word['japanese'],
                            'reading' => $word['reading'],
                            'english' => $word['english'],
                            'jlpt_level' => $word['jlpt_level'] ?? null,
                            'part_of_speech' => $word['part_of_speech'] ?? null,
                            'method' => 'semantic_search_priority'
                        ];
                        
                        $selectedWords[] = $wordData;
                    }
                }
                
                if (count($selectedWords) >= $numRequested) {
                    \Log::info('selectWordsWithSemanticSearch: Semantic search with topics provided sufficient results', [
                        'selected' => count($selectedWords)
                    ]);
                    return $selectedWords;
                }
            }
            
            // Use AI parsing + database filtering as fallback
            $selectedWords = $this->selectWordsWithAIParsing($query, $parsed, $numRequested, $existingWordIds);
            
            if (count($selectedWords) >= $numRequested) {
                \Log::info('selectWordsWithSemanticSearch: AI parsing provided sufficient results', [
                    'selected' => count($selectedWords)
                ]);
                return $selectedWords;
            }
            
            // If AI parsing didn't provide enough results, try semantic search with words_left (as additional fallback)
            if (!empty($parsed['words_left'])) {
                \Log::info('selectWordsWithSemanticSearch: AI parsing insufficient, trying semantic search with words_left as fallback', [
                    'words_left' => $parsed['words_left']
                ]);
                
                $semanticQuery = implode(' ', $parsed['words_left']);
                $semanticWords = $embeddingService->searchSemantic($semanticQuery, $numRequested * 5);
                
                // Convert to array and shuffle semantic results for better randomization
                $semanticWordsArray = $semanticWords->toArray();
                shuffle($semanticWordsArray);
                
                // Filter out words already selected and already in deck
                foreach ($semanticWordsArray as $word) {
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
            } else {
                // If words_left is empty but we have a topic, try semantic search with the deck title
                \Log::info('selectWordsWithSemanticSearch: AI parsing provided results but no words_left, trying semantic search with deck title', [
                    'deck_title' => $deckTitle
                ]);
                
                $semanticWords = $embeddingService->searchSemantic($deckTitle, $numRequested * 5);
                
                // Convert to array and shuffle semantic results for better randomization
                $semanticWordsArray = $semanticWords->toArray();
                shuffle($semanticWordsArray);
                
                // Filter out words already selected and already in deck
                foreach ($semanticWordsArray as $word) {
                    if (count($selectedWords) >= $numRequested) break;
                    
                    $wordId = $word['id'] ?? null;
                    if ($wordId && !in_array($wordId, $existingWordIds)) {
                        $wordData = [
                            'japanese' => $word['japanese'],
                            'reading' => $word['reading'],
                            'english' => $word['english'],
                            'jlpt_level' => $word['jlpt_level'] ?? null,
                            'part_of_speech' => $word['part_of_speech'] ?? null,
                            'method' => 'ai_parsing_title_semantic'
                        ];
                        
                        $selectedWords[] = $wordData;
                    }
                }
                
                if (count($selectedWords) >= $numRequested) {
                    \Log::info('selectWordsWithSemanticSearch: AI + title semantic search provided sufficient results', [
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
                'results_count' => count($semanticResults),
                'top_results' => array_slice($semanticResults->toArray(), 0, 5)
            ]);
            
            // Convert to array and shuffle results for better randomization
            $semanticResultsArray = $semanticResults->toArray();
            shuffle($semanticResultsArray);
            
            // Filter out words already in deck and add to selection
            foreach ($semanticResultsArray as $word) {
                if (count($selectedWords) >= $numRequested) break;
                
                $wordId = $word['id'] ?? null;
                if ($wordId && !in_array($wordId, $existingWordIds)) {
                    $wordData = [
                        'japanese' => $word['japanese'],
                        'reading' => $word['reading'],
                        'english' => $word['english'],
                        'jlpt_level' => $word['jlpt_level'] ?? null,
                        'part_of_speech' => $word['part_of_speech'] ?? null,
                        'method' => 'semantic_search'
                    ];
                    
                    $selectedWords[] = $wordData;
                }
            }
            
            if (count($selectedWords) >= $numRequested) {
                \Log::info('selectWordsWithSemanticSearch: Semantic search provided sufficient results', [
                    'selected' => count($selectedWords)
                ]);
                return $selectedWords;
            }
            
        } catch (\Exception $e) {
            \Log::error('selectWordsWithSemanticSearch: Semantic search failed', [
                'error' => $e->getMessage(),
                'search_query' => $searchQuery
            ]);
        }

        // Step 3: Fallback to random selection
        \Log::info('selectWordsWithSemanticSearch: Using fallback random selection');
        
        $randomWords = $query->inRandomOrder()->limit($numRequested - count($selectedWords))->get();
        
        foreach ($randomWords as $word) {
            $wordData = [
                'japanese' => $word->japanese,
                'reading' => $word->reading,
                'english' => $word->english,
                'jlpt_level' => $word->jlpt_level,
                'part_of_speech' => $word->part_of_speech,
                'method' => 'random_fallback'
            ];
            
            $selectedWords[] = $wordData;
        }
        
        \Log::info('selectWordsWithSemanticSearch: Final results', [
            'total_selected' => count($selectedWords),
            'methods_used' => array_unique(array_column($selectedWords, 'method'))
        ]);
        
        return $selectedWords;
    }

    /**
     * Select words using AI parsing results
     */
    private function selectWordsWithAIParsing($query, $parsed, $numRequested, $existingWordIds)
    {
        $selectedWords = [];
        
        // Apply JLPT level filter if specified in parsing
        if (!empty($parsed['levels'])) {
            $query->whereIn('jlpt_level', $parsed['levels']);
        }
        
        // Apply part of speech filter if specified in parsing
        if (!empty($parsed['categories'])) {
            $query->whereIn('part_of_speech', $parsed['categories']);
        }
        
        // Get words matching the AI parsing criteria
        $matchingWords = $query->inRandomOrder()->limit($numRequested * 2)->get();
        
        foreach ($matchingWords as $word) {
            if (count($selectedWords) >= $numRequested) break;
            
            if (!in_array($word->id, $existingWordIds)) {
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
        }
        
        return $selectedWords;
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
            'beach', 'ocean', 'sea', 'water', 'nature', 'outdoor',
            'fish', 'bird', 'cat', 'dog', 'animal', 'pet'
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
     * Get total available words with current constraints
     */
    private function getTotalAvailableWords($deck, $existingWordIds)
    {
        $query = \App\Models\Word::query();
        
        // Apply JLPT level filter if deck has JLPT level
        if ($deck->jlpt_level) {
            $query->where('jlpt_level', $deck->jlpt_level);
        }
        
        // Exclude words already in the deck
        if (!empty($existingWordIds)) {
            $query->whereNotIn('id', $existingWordIds);
        }
        
        return $query->count();
    }

    /**
     * Generate words for an admin deck
     */
    public function generateWords(Request $request, $deckId)
    {
        // Check if current user is admin
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'num' => 'required|integer|min:1|max:100',
        ]);

        $deck = Deck::find($deckId);
        if (!$deck) {
            return response()->json(['error' => 'Deck not found'], 404);
        }

        // Only allow generation for admin decks
        if ($deck->category !== 'admin') {
            return response()->json(['error' => 'Can only generate words for admin decks'], 403);
        }

        $numRequested = $request->num;
        $deckTitle = $deck->name;

        // Get existing word IDs in this deck to avoid duplicates
        $existingWordIds = $deck->words()->pluck('words.id')->toArray();

        // Build query for word selection
        $query = \App\Models\Word::query();
        
        // Apply JLPT level filter if deck has JLPT level
        if ($deck->jlpt_level) {
            $query->where('jlpt_level', $deck->jlpt_level);
        }

        // Exclude words already in the deck
        if (!empty($existingWordIds)) {
            $query->whereNotIn('id', $existingWordIds);
        }

        // Use the same intelligent word selection logic as regular users
        $selectedWords = $this->selectWordsWithSemanticSearch($query, $deckTitle, $numRequested, $existingWordIds);
        
        // Add the selected words to the deck
        $wordIds = [];
        foreach ($selectedWords as $word) {
            // Find the word in the database and get its ID
            $dbWord = \App\Models\Word::where('japanese', $word['japanese'])->first();
            if ($dbWord) {
                $wordIds[] = $dbWord->id;
            }
        }
        
        if (!empty($wordIds)) {
            $deck->words()->attach($wordIds);
        }
        
        // Calculate total available words with current constraints
        $totalAvailable = $this->getTotalAvailableWords($deck, $existingWordIds);
        
        return response()->json([
            'words' => $selectedWords,
            'exhausted' => count($selectedWords) < $numRequested,
            'total_available' => $totalAvailable,
            'constraints_exhausted' => $totalAvailable <= count($existingWordIds),
        ]);
    }

    /**
     * Add words to an admin deck
     */
    public function addWords(Request $request, $deckId)
    {
        // Check if current user is admin
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'words' => 'required|array',
            'words.*.japanese' => 'required|string',
            'words.*.reading' => 'required|string',
            'words.*.meaning' => 'required|string',
        ]);

        $deck = Deck::find($deckId);
        if (!$deck) {
            return response()->json(['error' => 'Deck not found'], 404);
        }

        // Only allow adding words to admin decks
        if ($deck->category !== 'admin') {
            return response()->json(['error' => 'Can only add words to admin decks'], 403);
        }

        $addedWords = [];
        $existingWords = $deck->words()->pluck('words.japanese')->toArray();

        foreach ($request->words as $wordData) {
            // Skip if word already exists in deck
            if (in_array($wordData['japanese'], $existingWords)) {
                continue;
            }

            // Check if word exists in database
            $word = Word::where('japanese', $wordData['japanese'])->first();
            
            if (!$word) {
                // Create new word if it doesn't exist
                $word = Word::create([
                    'japanese' => $wordData['japanese'],
                    'reading' => $wordData['reading'],
                    'english' => $wordData['meaning'],
                    'jlpt_level' => $wordData['jlpt'] ?? null,
                ]);
            }

            // Add word to deck
            $deck->words()->attach($word->id);
            $addedWords[] = $word;
        }

        return response()->json([
            'message' => 'Words added successfully',
            'added_count' => count($addedWords),
            'words' => $addedWords
        ]);
    }

    /**
     * Get words in an admin deck
     */
    public function getDeckWords($deckId)
    {
        // Check if current user is admin
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $deck = Deck::find($deckId);
        if (!$deck) {
            return response()->json(['error' => 'Deck not found'], 404);
        }

        // Only allow viewing words for admin decks
        if ($deck->category !== 'admin') {
            return response()->json(['error' => 'Can only view words for admin decks'], 403);
        }

        $words = $deck->words()->get();

        return response()->json([
            'words' => $words
        ]);
    }
}
