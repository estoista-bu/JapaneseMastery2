<?php

namespace App\Http\Controllers;

use App\Models\Kana;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class KanaController extends Controller
{
    /**
     * Get all kana characters.
     */
    public function getAllKana(Request $request): JsonResponse
    {
        $type = $request->query('type'); // hiragana, katakana, or null for all
        $category = $request->query('category'); // basic, dakuten, handakuten, small, or null for all
        
        $query = Kana::query();
        
        if ($type) {
            $query->where('type', $type);
        }
        
        if ($category) {
            $query->where('category', $category);
        }
        
        $kana = $query->orderBy('order')->get();
        
        return response()->json([
            'kana' => $kana
        ]);
    }

    /**
     * Get hiragana characters.
     */
    public function getHiragana(Request $request): JsonResponse
    {
        $category = $request->query('category');
        
        $query = Kana::where('type', 'hiragana');
        
        if ($category) {
            $query->where('category', $category);
        }
        
        $hiragana = $query->orderBy('order')->get();
        
        return response()->json([
            'hiragana' => $hiragana
        ]);
    }

    /**
     * Get katakana characters.
     */
    public function getKatakana(Request $request): JsonResponse
    {
        $category = $request->query('category');
        
        $query = Kana::where('type', 'katakana');
        
        if ($category) {
            $query->where('category', $category);
        }
        
        $katakana = $query->orderBy('order')->get();
        
        return response()->json([
            'katakana' => $katakana
        ]);
    }

    /**
     * Get kana by category.
     */
    public function getKanaByCategory(Request $request, string $category): JsonResponse
    {
        $kana = Kana::where('category', $category)->orderBy('order')->get();
        
        return response()->json([
            'kana' => $kana
        ]);
    }

    /**
     * Get random kana for practice.
     */
    public function getRandomKana(Request $request): JsonResponse
    {
        $request->validate([
            'count' => 'integer|min:1|max:50',
            'type' => 'string|in:hiragana,katakana',
            'category' => 'string|in:basic,dakuten,handakuten,small',
        ]);

        $count = $request->input('count', 10);
        $type = $request->input('type');
        $category = $request->input('category');
        
        $kana = Kana::getRandomForPractice($count, $type);
        
        if ($category) {
            $kana = $kana->where('category', $category);
        }
        
        return response()->json([
            'kana' => $kana->values()
        ]);
    }

    /**
     * Get kana statistics.
     */
    public function getKanaStats(): JsonResponse
    {
        $stats = [
            'total' => Kana::count(),
            'hiragana' => [
                'total' => Kana::where('type', 'hiragana')->count(),
                'basic' => Kana::where('type', 'hiragana')->where('category', 'basic')->count(),
                'dakuten' => Kana::where('type', 'hiragana')->where('category', 'dakuten')->count(),
                'handakuten' => Kana::where('type', 'hiragana')->where('category', 'handakuten')->count(),
                'small' => Kana::where('type', 'hiragana')->where('category', 'small')->count(),
            ],
            'katakana' => [
                'total' => Kana::where('type', 'katakana')->count(),
                'basic' => Kana::where('type', 'katakana')->where('category', 'basic')->count(),
                'dakuten' => Kana::where('type', 'katakana')->where('category', 'dakuten')->count(),
                'handakuten' => Kana::where('type', 'katakana')->where('category', 'handakuten')->count(),
                'small' => Kana::where('type', 'katakana')->where('category', 'small')->count(),
            ],
        ];
        
        return response()->json([
            'stats' => $stats
        ]);
    }
}

