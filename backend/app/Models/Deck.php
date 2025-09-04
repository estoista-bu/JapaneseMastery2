<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Deck extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'jlpt_level',
        'category',
        'is_active',
        'is_public',
        'word_count',
        'user_id',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_public' => 'boolean',
        'word_count' => 'integer',
    ];

    /**
     * Boot method to automatically generate slug
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($deck) {
            if (empty($deck->slug)) {
                $deck->slug = static::generateUniqueSlug($deck->name);
            }
        });
    }

    /**
     * Check if a name is a reserved JLPT deck name
     */
    protected static function isReservedJlptName($name)
    {
        // Normalize the name: convert to lowercase and trim
        $normalizedName = strtolower(trim($name));
        
        // Match exact "jlpt n#" or "jlpt-n#" pattern
        return (bool)preg_match('/^jlpt[\s-]n[1-5]$/', $normalizedName);
    }

    /**
     * Generate a unique slug from the given name
     */
    protected static function generateUniqueSlug($name)
    {
        if (static::isReservedJlptName($name)) {
            throw new \InvalidArgumentException('The name "' . $name . '" is reserved for JLPT core vocabulary decks. Please choose a different name.');
        }

        $slug = Str::slug($name);
        $originalSlug = $slug;
        $counter = 1;

        while (static::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }

    /**
     * Get the user that owns this deck.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the words in this deck.
     */
    public function words(): BelongsToMany
    {
        return $this->belongsToMany(Word::class, 'deck_word')
                    ->withPivot('order')
                    ->withTimestamps()
                    ->orderBy('order');
    }

    /**
     * Scope to filter by JLPT level
     */
    public function scopeByJlptLevel($query, $level)
    {
        return $query->where('jlpt_level', $level);
    }

    /**
     * Scope to filter active decks
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to filter by category
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope to filter by user
     */
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Update the word count for this deck
     */
    public function updateWordCount()
    {
        $this->word_count = $this->words()->count();
        $this->save();
    }
} 