<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Word extends Model
{
    use HasFactory;

    protected $fillable = [
        'japanese',
        'reading',
        'english',
        'jlpt_level',
        'example_sentence',
        'part_of_speech',
    ];

    protected $casts = [
        'jlpt_level' => 'string',
    ];

    /**
     * Get the decks that contain this word.
     */
    public function decks(): BelongsToMany
    {
        return $this->belongsToMany(Deck::class, 'deck_word')
                    ->withPivot('order')
                    ->withTimestamps();
    }

    /**
     * Scope to filter by JLPT level
     */
    public function scopeByJlptLevel($query, $level)
    {
        return $query->where('jlpt_level', $level);
    }

    /**
     * Scope to search words
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('japanese', 'like', "%{$search}%")
              ->orWhere('reading', 'like', "%{$search}%")
              ->orWhere('english', 'like', "%{$search}%");
        });
    }
} 