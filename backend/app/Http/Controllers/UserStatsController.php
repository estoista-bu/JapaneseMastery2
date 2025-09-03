<?php

namespace App\Http\Controllers;

use App\Models\UserStats;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class UserStatsController extends Controller
{
    /**
     * Get all user stats for all content types.
     */
    public function getUserStats(Request $request): JsonResponse
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json([
                'message' => 'User not authenticated'
            ], 401);
        }

        // Get or create stats for all content types
        $customDecksStats = UserStats::getOrCreateStats($user->id, UserStats::CONTENT_TYPE_CUSTOM_DECKS);
        $providedDecksStats = UserStats::getOrCreateStats($user->id, UserStats::CONTENT_TYPE_PROVIDED_DECKS);
        $kanaPracticeStats = UserStats::getOrCreateStats($user->id, UserStats::CONTENT_TYPE_KANA_PRACTICE);
        $jlptDecksStats = UserStats::getOrCreateStats($user->id, UserStats::CONTENT_TYPE_JLPT_DECKS);

        return response()->json([
            'stats' => [
                'custom_decks' => $customDecksStats,
                'provided_decks' => $providedDecksStats,
                'kana_practice' => $kanaPracticeStats,
                'jlpt_decks' => $jlptDecksStats,
            ]
        ]);
    }

    /**
     * Get stats for a specific content type.
     */
    public function getStatsByContentType(Request $request, string $contentType): JsonResponse
    {
        $request->validate([
            'content_type' => 'required|string|in:custom_decks,provided_decks,kana_practice,jlpt_decks',
        ]);

        $user = auth()->user();
        if (!$user) {
            return response()->json([
                'message' => 'User not authenticated'
            ], 401);
        }

        $stats = UserStats::getOrCreateStats($user->id, $contentType);

        return response()->json([
            'stats' => $stats
        ]);
    }

    /**
     * Update memory test stats for a specific content type.
     */
    public function updateMemoryStats(Request $request): JsonResponse
    {
        $request->validate([
            'content_type' => 'required|string|in:custom_decks,provided_decks,kana_practice,jlpt_decks',
            'score' => 'required|integer|min:0',
            'total' => 'required|integer|min:0',
        ]);

        $user = auth()->user();
        if (!$user) {
            return response()->json([
                'message' => 'User not authenticated'
            ], 401);
        }

        $stats = UserStats::getOrCreateStats($user->id, $request->content_type);
        $stats->updateMemoryStats($request->score, $request->total);

        return response()->json([
            'message' => 'Memory stats updated successfully',
            'stats' => $stats->fresh()
        ]);
    }

    /**
     * Update pronunciation test stats for a specific content type.
     */
    public function updatePronunciationStats(Request $request): JsonResponse
    {
        $request->validate([
            'content_type' => 'required|string|in:custom_decks,provided_decks,kana_practice,jlpt_decks',
            'score' => 'required|integer|min:0',
            'total' => 'required|integer|min:0',
        ]);

        $user = auth()->user();
        if (!$user) {
            return response()->json([
                'message' => 'User not authenticated'
            ], 401);
        }

        $stats = UserStats::getOrCreateStats($user->id, $request->content_type);
        $stats->updatePronunciationStats($request->score, $request->total);

        return response()->json([
            'message' => 'Pronunciation stats updated successfully',
            'stats' => $stats->fresh()
        ]);
    }

    /**
     * Update listening test stats for a specific content type.
     */
    public function updateListeningStats(Request $request): JsonResponse
    {
        $request->validate([
            'content_type' => 'required|string|in:custom_decks,provided_decks,kana_practice,jlpt_decks',
            'score' => 'required|integer|min:0',
            'total' => 'required|integer|min:0',
        ]);

        $user = auth()->user();
        if (!$user) {
            return response()->json([
                'message' => 'User not authenticated'
            ], 401);
        }

        $stats = UserStats::getOrCreateStats($user->id, $request->content_type);
        $stats->updateListeningStats($request->score, $request->total);

        return response()->json([
            'message' => 'Listening stats updated successfully',
            'stats' => $stats->fresh()
        ]);
    }

    /**
     * Update kana practice stats for a specific content type.
     */
    public function updateKanaStats(Request $request): JsonResponse
    {
        $request->validate([
            'content_type' => 'required|string|in:custom_decks,provided_decks,kana_practice,jlpt_decks',
            'score' => 'required|integer|min:0',
            'total' => 'required|integer|min:0',
        ]);

        $user = auth()->user();
        if (!$user) {
            return response()->json([
                'message' => 'User not authenticated'
            ], 401);
        }

        $stats = UserStats::getOrCreateStats($user->id, $request->content_type);
        $stats->updateKanaStats($request->score, $request->total);

        return response()->json([
            'message' => 'Kana stats updated successfully',
            'stats' => $stats->fresh()
        ]);
    }

    /**
     * Update view words count for a specific content type.
     */
    public function updateViewWordsCount(Request $request): JsonResponse
    {
        $request->validate([
            'content_type' => 'required|string|in:custom_decks,provided_decks,kana_practice,jlpt_decks',
            'count' => 'integer|min:1',
        ]);

        $user = auth()->user();
        if (!$user) {
            return response()->json([
                'message' => 'User not authenticated'
            ], 401);
        }

        $stats = UserStats::getOrCreateStats($user->id, $request->content_type);
        $count = $request->input('count', 1);
        $stats->updateViewWordsCount($count);

        return response()->json([
            'message' => 'View words count updated successfully',
            'stats' => $stats->fresh()
        ]);
    }

    /**
     * Update word mastery stats for a specific content type.
     */
    public function updateWordMasteryStats(Request $request): JsonResponse
    {
        $request->validate([
            'content_type' => 'required|string|in:custom_decks,provided_decks,kana_practice,jlpt_decks',
            'mastery_stats' => 'required|array',
        ]);

        $user = auth()->user();
        if (!$user) {
            return response()->json([
                'message' => 'User not authenticated'
            ], 401);
        }

        $stats = UserStats::getOrCreateStats($user->id, $request->content_type);
        $stats->updateWordMasteryStats($request->mastery_stats);

        return response()->json([
            'message' => 'Word mastery stats updated successfully',
            'stats' => $stats->fresh()
        ]);
    }

    /**
     * Update quiz results for a specific content type.
     */
    public function updateQuizResults(Request $request): JsonResponse
    {
        $request->validate([
            'content_type' => 'required|string|in:custom_decks,provided_decks,kana_practice,jlpt_decks',
            'type' => 'required|string|in:provided,ai',
            'results' => 'required|array',
        ]);

        $user = auth()->user();
        if (!$user) {
            return response()->json([
                'message' => 'User not authenticated'
            ], 401);
        }

        $stats = UserStats::getOrCreateStats($user->id, $request->content_type);
        $stats->updateQuizResults($request->type, $request->results);

        return response()->json([
            'message' => 'Quiz results updated successfully',
            'stats' => $stats->fresh()
        ]);
    }

    /**
     * Update quiz highscores for a specific content type.
     */
    public function updateQuizHighscores(Request $request): JsonResponse
    {
        $request->validate([
            'content_type' => 'required|string|in:custom_decks,provided_decks,kana_practice,jlpt_decks',
            'highscores' => 'required|array',
        ]);

        $user = auth()->user();
        if (!$user) {
            return response()->json([
                'message' => 'User not authenticated'
            ], 401);
        }

        $stats = UserStats::getOrCreateStats($user->id, $request->content_type);
        $stats->updateQuizHighscores($request->highscores);

        return response()->json([
            'message' => 'Quiz highscores updated successfully',
            'stats' => $stats->fresh()
        ]);
    }

    /**
     * Update completed lessons for a specific content type.
     */
    public function updateCompletedLessons(Request $request): JsonResponse
    {
        $request->validate([
            'content_type' => 'required|string|in:custom_decks,provided_decks,kana_practice,jlpt_decks',
            'lessons' => 'required|array',
        ]);

        $user = auth()->user();
        if (!$user) {
            return response()->json([
                'message' => 'User not authenticated'
            ], 401);
        }

        $stats = UserStats::getOrCreateStats($user->id, $request->content_type);
        $stats->updateCompletedLessons($request->lessons);

        return response()->json([
            'message' => 'Completed lessons updated successfully',
            'stats' => $stats->fresh()
        ]);
    }

    /**
     * Update deck progress for a specific content type.
     */
    public function updateDeckProgress(Request $request): JsonResponse
    {
        $request->validate([
            'content_type' => 'required|string|in:custom_decks,provided_decks,kana_practice,jlpt_decks',
            'progress' => 'required|array',
        ]);

        $user = auth()->user();
        if (!$user) {
            return response()->json([
                'message' => 'User not authenticated'
            ], 401);
        }

        $stats = UserStats::getOrCreateStats($user->id, $request->content_type);
        $stats->updateDeckProgress($request->progress);

        return response()->json([
            'message' => 'Deck progress updated successfully',
            'stats' => $stats->fresh()
        ]);
    }

    /**
     * Reset stats for a specific content type.
     */
    public function resetStats(Request $request): JsonResponse
    {
        $request->validate([
            'content_type' => 'required|string|in:custom_decks,provided_decks,kana_practice,jlpt_decks',
        ]);

        $user = auth()->user();
        if (!$user) {
            return response()->json([
                'message' => 'User not authenticated'
            ], 401);
        }

        $stats = UserStats::where('user_id', $user->id)
            ->where('content_type', $request->content_type)
            ->first();

        if ($stats) {
            $stats->update([
                'memory_score' => 0,
                'memory_total' => 0,
                'pronunciation_score' => 0,
                'pronunciation_total' => 0,
                'listening_score' => 0,
                'listening_total' => 0,
                'view_words_count' => 0,
                'quiz_results_provided' => [],
                'quiz_results_ai' => [],
                'quiz_highscores' => [],
                'word_mastery_stats' => [],
                'completed_lessons' => [],
                'deck_progress' => [],
            ]);
        }

        return response()->json([
            'message' => 'Stats reset successfully',
            'stats' => $stats ? $stats->fresh() : null
        ]);
    }

    /**
     * Reset all stats for all content types.
     */
    public function resetAllStats(Request $request): JsonResponse
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json([
                'message' => 'User not authenticated'
            ], 401);
        }

        UserStats::where('user_id', $user->id)->delete();

        return response()->json([
            'message' => 'All stats reset successfully'
        ]);
    }
}
