<?php

namespace App\Helpers;

use App\Models\UserStats;

class ContentTypeHelper
{
    /**
     * Determine content type based on deck category.
     */
    public static function getContentTypeFromDeckCategory(?string $category): string
    {
        return match($category) {
            'user' => UserStats::CONTENT_TYPE_CUSTOM_DECKS,
            'kana' => UserStats::CONTENT_TYPE_KANA_PRACTICE,
            'jlpt' => UserStats::CONTENT_TYPE_JLPT_DECKS,
            default => UserStats::CONTENT_TYPE_PROVIDED_DECKS,
        };
    }

    /**
     * Get content type display name.
     */
    public static function getContentTypeDisplayName(string $contentType): string
    {
        return match($contentType) {
            UserStats::CONTENT_TYPE_CUSTOM_DECKS => 'Custom Decks',
            UserStats::CONTENT_TYPE_PROVIDED_DECKS => 'Provided Decks',
            UserStats::CONTENT_TYPE_KANA_PRACTICE => 'Kana Practice',
            UserStats::CONTENT_TYPE_JLPT_DECKS => 'JLPT Decks',
            default => 'Unknown'
        };
    }

    /**
     * Get all content types.
     */
    public static function getAllContentTypes(): array
    {
        return [
            UserStats::CONTENT_TYPE_CUSTOM_DECKS,
            UserStats::CONTENT_TYPE_PROVIDED_DECKS,
            UserStats::CONTENT_TYPE_KANA_PRACTICE,
            UserStats::CONTENT_TYPE_JLPT_DECKS,
        ];
    }
}
