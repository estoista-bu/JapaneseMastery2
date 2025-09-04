<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\JlptController;
use App\Http\Controllers\UserStatsController;
use App\Http\Controllers\KanaController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\UserProfileController;
use App\Http\Controllers\AdminDeckController;

// Test route
Route::get('/test', function () {
    return response()->json(['message' => 'API is working!']);
});

// Network test route
Route::get('/network-test', function () {
    return response()->json([
        'message' => 'Network connectivity test successful!',
        'timestamp' => now()->toISOString(),
        'server_ip' => request()->server('SERVER_ADDR'),
        'client_ip' => request()->ip(),
        'user_agent' => request()->userAgent()
    ]);
});

// Simple test route
Route::get('/simple', function () {
    return 'Simple test';
});

// JLPT routes
Route::prefix('jlpt')->middleware('auth:sanctum')->group(function () {
    Route::get('/decks', [JlptController::class, 'getDecks']);
    Route::get('/decks/{slug}', [JlptController::class, 'getDeck']);
    Route::get('/words', [JlptController::class, 'getWords']);
    Route::get('/words/search', [JlptController::class, 'searchWords']);
    Route::get('/words/{id}', [JlptController::class, 'getWord']);
    Route::get('/words/level/{level}', [JlptController::class, 'getWordsByLevel']);
    
    // Word management routes
    Route::post('/decks/add-word', [JlptController::class, 'addWordToDeck']);
    Route::delete('/decks/remove-word', [JlptController::class, 'removeWordFromDeck']);
    Route::put('/words/{id}', [JlptController::class, 'updateWord']);
    
    // Deck management routes
    Route::post('/decks', [JlptController::class, 'createDeck']);
    Route::put('/decks/{slug}', [JlptController::class, 'updateDeck']);
    Route::delete('/decks/{id}', [JlptController::class, 'deleteDeck']);
    Route::get('/decks/category/{category}', [JlptController::class, 'getDecksByCategory']);

    // AI-assisted selection from DB (no repeats, JLPT/topic aware)
    Route::post('/decks/select-words', [JlptController::class, 'selectWordsForDeck']);
    
    // Semantic search using embeddings
    Route::post('/words/semantic-search', [JlptController::class, 'searchSemantic']);
    
    // Generate embeddings (admin only)
    Route::post('/embeddings/generate', [JlptController::class, 'generateEmbeddings']);
});

// User Stats routes
Route::prefix('stats')->middleware('auth:sanctum')->group(function () {
    Route::get('/', [UserStatsController::class, 'getUserStats']);
    Route::get('/{contentType}', [UserStatsController::class, 'getStatsByContentType']);
    Route::post('/memory', [UserStatsController::class, 'updateMemoryStats']);
    Route::post('/pronunciation', [UserStatsController::class, 'updatePronunciationStats']);
    Route::post('/listening', [UserStatsController::class, 'updateListeningStats']);
    Route::post('/kana', [UserStatsController::class, 'updateKanaStats']);
    Route::post('/view-words', [UserStatsController::class, 'updateViewWordsCount']);
    Route::post('/quiz-results', [UserStatsController::class, 'updateQuizResults']);
    Route::post('/quiz-highscores', [UserStatsController::class, 'updateQuizHighscores']);
    Route::post('/completed-lessons', [UserStatsController::class, 'updateCompletedLessons']);
    Route::post('/deck-progress', [UserStatsController::class, 'updateDeckProgress']);
    Route::post('/reset', [UserStatsController::class, 'resetStats']);
    Route::post('/reset-all', [UserStatsController::class, 'resetAllStats']);
    Route::post('/word-mastery', [UserStatsController::class, 'updateWordMasteryStats']);
});

// Admin User Management routes
Route::prefix('admin')->middleware('auth:sanctum')->group(function () {
    Route::get('/users', [UserController::class, 'getAllUsers']);
    Route::get('/stats', [UserController::class, 'getAdminStats']);
    Route::put('/users/{userId}/password', [UserController::class, 'updateUserPassword']);
    Route::post('/users/send-password-reset', [UserController::class, 'sendPasswordResetEmail']);
    Route::get('/users/{userId}/stats', [UserController::class, 'getUserStats']);
    Route::get('/users/{userId}/profile', [UserController::class, 'getUserProfile']);
    Route::put('/users/{userId}/profile', [UserController::class, 'updateUserProfile']);
    
    // Admin Deck Management routes
    Route::prefix('deck-management')->group(function () {
        Route::get('/decks', [AdminDeckController::class, 'getAllDecks']);
        Route::post('/decks', [AdminDeckController::class, 'createDeck']);
        Route::put('/decks/{deckId}', [AdminDeckController::class, 'updateDeck']);
        Route::delete('/decks/{deckId}', [AdminDeckController::class, 'deleteDeck']);
        Route::post('/decks/{deckId}/generate-words', [AdminDeckController::class, 'generateWords']);
        Route::post('/decks/{deckId}/add-words', [AdminDeckController::class, 'addWords']);
        Route::get('/decks/{deckId}/words', [AdminDeckController::class, 'getDeckWords']);
    });
    
    // Group Management routes
    Route::get('/groups', [GroupController::class, 'getAllGroups']);
    Route::post('/groups', [GroupController::class, 'createGroup']);
    Route::get('/groups/{groupId}', [GroupController::class, 'getGroupDetails']);
    Route::put('/groups/{groupId}', [GroupController::class, 'updateGroup']);
    Route::delete('/groups/{groupId}', [GroupController::class, 'deleteGroup']);
    Route::get('/groups/{groupId}/available-users', [GroupController::class, 'getAvailableUsers']);
    Route::post('/groups/{groupId}/add-users', [GroupController::class, 'addUsersToGroup']);
    Route::post('/groups/{groupId}/remove-users', [GroupController::class, 'removeUsersFromGroup']);
    Route::get('/available-users', [GroupController::class, 'getAvailableUsers']);
});

// Test route to check if POST requests work
Route::post('/test', function () {
    return response()->json(['message' => 'Test route works']);
});

// Public routes
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);

// Kana routes
Route::prefix('kana')->group(function () {
    Route::get('/', [KanaController::class, 'getAllKana']);
    Route::get('/hiragana', [KanaController::class, 'getHiragana']);
    Route::get('/katakana', [KanaController::class, 'getKatakana']);
    Route::get('/category/{category}', [KanaController::class, 'getKanaByCategory']);
    Route::get('/random', [KanaController::class, 'getRandomKana']);
    Route::get('/stats', [KanaController::class, 'getKanaStats']);
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    
    // Profile routes
    Route::prefix('profile')->group(function () {
        Route::get('/', [UserProfileController::class, 'getProfile']);
        Route::put('/', [UserProfileController::class, 'updateProfile']);
        Route::post('/upload-picture', [UserProfileController::class, 'uploadProfilePicture']);
        Route::delete('/picture', [UserProfileController::class, 'deleteProfilePicture']);
    });
}); 