<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserStats extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'content_type',
        'memory_score',
        'memory_total',
        'pronunciation_score',
        'pronunciation_total',
        'listening_score',
        'listening_total',
        'view_words_count',
        'quiz_results_provided',
        'quiz_results_ai',
        'quiz_highscores',
        'word_mastery_stats',
        'completed_lessons',
        'deck_progress',
    ];

    protected $casts = [
        'quiz_results_provided' => 'array',
        'quiz_results_ai' => 'array',
        'quiz_highscores' => 'array',
        'word_mastery_stats' => 'array',
        'completed_lessons' => 'array',
        'deck_progress' => 'array',
    ];

    // Content type constants
    const CONTENT_TYPE_CUSTOM_DECKS = 'custom_decks';
    const CONTENT_TYPE_PROVIDED_DECKS = 'provided_decks';
    const CONTENT_TYPE_KANA_PRACTICE = 'kana_practice';
    const CONTENT_TYPE_JLPT_DECKS = 'jlpt_decks';

    /**
     * Get the user that owns the stats.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get or create stats for a specific content type and user.
     */
    public static function getOrCreateStats(int $userId, string $contentType): self
    {
        return static::firstOrCreate(
            ['user_id' => $userId, 'content_type' => $contentType],
            [
                'memory_score' => 0,
                'memory_total' => 0,
                'pronunciation_score' => 0,
                'pronunciation_total' => 0,
                'listening_score' => 0,
                'listening_total' => 0,
                'view_words_count' => 0,
            ]
        );
    }

    /**
     * Get all stats for a user.
     */
    public static function getAllStatsForUser(int $userId): \Illuminate\Database\Eloquent\Collection
    {
        return static::where('user_id', $userId)->get();
    }

    /**
     * Get memory test rate as percentage.
     */
    public function getMemoryRateAttribute(): float
    {
        if ($this->memory_total === 0) {
            return 0.0;
        }
        return ($this->memory_score / $this->memory_total) * 100;
    }

    /**
     * Get pronunciation test rate as percentage.
     */
    public function getPronunciationRateAttribute(): float
    {
        if ($this->pronunciation_total === 0) {
            return 0.0;
        }
        return ($this->pronunciation_score / $this->pronunciation_total) * 100;
    }

    /**
     * Get listening test rate as percentage.
     */
    public function getListeningRateAttribute(): float
    {
        if ($this->listening_total === 0) {
            return 0.0;
        }
        return ($this->listening_score / $this->listening_total) * 100;
    }

    /**
     * Update memory test stats.
     */
    public function updateMemoryStats(int $score, int $total): void
    {
        $this->memory_score += $score;
        $this->memory_total += $total;
        $this->save();
    }

    /**
     * Update pronunciation test stats.
     */
    public function updatePronunciationStats(int $score, int $total): void
    {
        $this->pronunciation_score += $score;
        $this->pronunciation_total += $total;
        $this->save();
    }

    /**
     * Update listening test stats.
     */
    public function updateListeningStats(int $score, int $total): void
    {
        $this->listening_score += $score;
        $this->listening_total += $total;
        $this->save();
    }

    /**
     * Update kana practice stats.
     */
    public function updateKanaStats(int $score, int $total): void
    {
        $this->memory_score += $score;
        $this->memory_total += $total;
        $this->save();
    }

    /**
     * Update view words count.
     */
    public function updateViewWordsCount(int $count = 1): void
    {
        $this->view_words_count += $count;
        $this->save();
    }

    /**
     * Update word mastery stats.
     */
    public function updateWordMasteryStats(array $masteryStats): void
    {
        $this->word_mastery_stats = $masteryStats;
        $this->save();
    }

    /**
     * Update quiz results.
     */
    public function updateQuizResults(string $type, array $results): void
    {
        if ($type === 'provided') {
            $this->quiz_results_provided = $results;
        } elseif ($type === 'ai') {
            $this->quiz_results_ai = $results;
        }
        $this->save();
    }

    /**
     * Update quiz highscores.
     */
    public function updateQuizHighscores(array $highscores): void
    {
        $this->quiz_highscores = $highscores;
        $this->save();
    }

    /**
     * Update completed lessons.
     */
    public function updateCompletedLessons(array $lessons): void
    {
        $this->completed_lessons = $lessons;
        $this->save();
    }

    /**
     * Update deck progress.
     */
    public function updateDeckProgress(array $progress): void
    {
        $this->deck_progress = $progress;
        $this->save();
    }

    /**
     * Get content type display name.
     */
    public function getContentTypeDisplayNameAttribute(): string
    {
        return match($this->content_type) {
            self::CONTENT_TYPE_CUSTOM_DECKS => 'Custom Decks',
            self::CONTENT_TYPE_PROVIDED_DECKS => 'Provided Decks',
            self::CONTENT_TYPE_KANA_PRACTICE => 'Kana Practice',
            self::CONTENT_TYPE_JLPT_DECKS => 'JLPT Decks',
            default => 'Unknown'
        };
    }
}
