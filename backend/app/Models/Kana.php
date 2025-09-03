<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kana extends Model
{
    use HasFactory;

    protected $table = 'kanas';

    protected $fillable = [
        'character',
        'romaji',
        'type',
        'category',
        'order',
    ];

    protected $casts = [
        'order' => 'integer',
    ];

    /**
     * Get all hiragana characters.
     */
    public static function getHiragana()
    {
        return static::where('type', 'hiragana')->orderBy('order')->get();
    }

    /**
     * Get all katakana characters.
     */
    public static function getKatakana()
    {
        return static::where('type', 'katakana')->orderBy('order')->get();
    }

    /**
     * Get kana by category.
     */
    public static function getByCategory(string $category)
    {
        return static::where('category', $category)->orderBy('order')->get();
    }

    /**
     * Get random kana for practice.
     */
    public static function getRandomForPractice(int $count = 10, string $type = null)
    {
        $query = static::query();
        
        if ($type) {
            $query->where('type', $type);
        }
        
        return $query->inRandomOrder()->limit($count)->get();
    }

    /**
     * Get display name for the kana.
     */
    public function getDisplayNameAttribute(): string
    {
        return "{$this->character} ({$this->romaji})";
    }
}
