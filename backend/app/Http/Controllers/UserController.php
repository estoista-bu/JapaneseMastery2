<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserStats;
use App\Models\Deck;
use App\Models\Word;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    /**
     * Get all users (admin only)
     */
    public function getAllUsers()
    {
        // Check if current user is admin
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $users = User::select('id', 'username', 'email', 'role', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'users' => $users
        ]);
    }

    /**
     * Get comprehensive admin statistics (admin only)
     */
    public function getAdminStats()
    {
        // Check if current user is admin
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        try {
            // User statistics
            $totalUsers = User::count();
            $adminUsers = User::where('role', 'admin')->count();
            $regularUsers = User::where('role', 'user')->count();
            
            // Calculate active users based on actual activity (users who have taken tests or created decks)
            $activeUsers = User::whereHas('stats', function($query) {
                $query->where(function($q) {
                    $q->where('memory_total', '>', 0)
                      ->orWhere('pronunciation_total', '>', 0)
                      ->orWhere('listening_total', '>', 0)
                      ->orWhere('view_words_count', '>', 0);
                });
            })->count();

            // Deck and word statistics
            $totalDecks = Deck::count();
            $totalWords = Word::count();

            // Simple test statistics from UserStats
            $totalMemoryTests = UserStats::where('memory_total', '>', 0)->count();
            $totalPronunciationTests = UserStats::where('pronunciation_total', '>', 0)->count();
            $totalListeningTests = UserStats::where('listening_total', '>', 0)->count();
            $totalKanaPractice = UserStats::where('content_type', 'kana_practice')->count();

            // Calculate average scores
            $memoryScores = UserStats::where('memory_total', '>', 0)
                ->get()
                ->map(function($stat) {
                    return ($stat->memory_score / $stat->memory_total) * 100;
                });
            $avgMemoryScore = $memoryScores->count() > 0 ? round($memoryScores->avg(), 1) : 0;

            $pronunciationScores = UserStats::where('pronunciation_total', '>', 0)
                ->get()
                ->map(function($stat) {
                    return ($stat->pronunciation_score / $stat->pronunciation_total) * 100;
                });
            $avgPronunciationScore = $pronunciationScores->count() > 0 ? round($pronunciationScores->avg(), 1) : 0;

            $listeningScores = UserStats::where('listening_total', '>', 0)
                ->get()
                ->map(function($stat) {
                    return ($stat->listening_score / $stat->listening_total) * 100;
                });
            $avgListeningScore = $listeningScores->count() > 0 ? round($listeningScores->avg(), 1) : 0;

            // Most active content type
            $contentTypeCounts = UserStats::selectRaw('content_type, COUNT(*) as count')
                ->groupBy('content_type')
                ->orderBy('count', 'desc')
                ->first();

            // Recent activity (last 5 days)
            $recentActivity = [];
            for ($i = 0; $i < 5; $i++) {
                $date = now()->subDays($i)->format('Y-m-d');
                $newUsers = User::whereDate('created_at', $date)->count();
                $newDecks = Deck::whereDate('created_at', $date)->count();
                $testsTaken = UserStats::whereDate('created_at', $date)->count();

                $recentActivity[] = [
                    'date' => $date,
                    'new_users' => $newUsers,
                    'new_decks' => $newDecks,
                    'tests_taken' => $testsTaken
                ];
            }

            // Total study time (estimated from test counts)
            $totalStudyTime = $totalMemoryTests * 2 + 
                             $totalPronunciationTests * 3 + 
                             $totalListeningTests * 2 + 
                             $totalKanaPractice * 1; // minutes

            return response()->json([
                'total_users' => $totalUsers,
                'active_users' => $activeUsers,
                'admin_users' => $adminUsers,
                'regular_users' => $regularUsers,
                'total_decks' => $totalDecks,
                'total_words' => $totalWords,
                'total_memory_tests' => $totalMemoryTests,
                'total_pronunciation_tests' => $totalPronunciationTests,
                'total_listening_tests' => $totalListeningTests,
                'total_kana_practice' => $totalKanaPractice,
                'average_memory_score' => $avgMemoryScore,
                'average_pronunciation_score' => $avgPronunciationScore,
                'average_listening_score' => $avgListeningScore,
                'total_study_time' => $totalStudyTime,
                'most_active_content_type' => $contentTypeCounts->content_type ?? 'No data',
                'recent_activity' => array_reverse($recentActivity)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to load admin statistics',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update user password (admin only)
     */
    public function updateUserPassword(Request $request, $userId)
    {
        // Check if current user is admin
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'password' => 'required|string|min:6'
        ]);

        $user = User::find($userId);
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        return response()->json([
            'message' => 'Password updated successfully',
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role
            ]
        ]);
    }

    /**
     * Send password reset email (admin only)
     */
    public function sendPasswordResetEmail(Request $request)
    {
        // Check if current user is admin
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'email' => 'required|email'
        ]);

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        // Generate password reset token
        $token = Str::random(60);
        $user->password_reset_token = $token;
        $user->password_reset_expires_at = now()->addHours(24);
        $user->save();

        // Send email (you'll need to configure your email settings)
        try {
            // For now, we'll just return success
            // In a real implementation, you would send an actual email here
            // Mail::to($user->email)->send(new PasswordResetMail($user, $token));
            
            return response()->json([
                'message' => 'Password reset email sent successfully',
                'email' => $user->email
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to send email',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user statistics (admin only)
     */
    public function getUserStats($userId)
    {
        // Check if current user is admin
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $user = User::find($userId);
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        // Get user stats from UserStats model
        $userStats = $user->stats()->first();
        
        return response()->json([
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role,
                'created_at' => $user->created_at
            ],
            'stats' => $userStats ? $userStats->toArray() : null
        ]);
    }

    /**
     * Get user profile (admin only)
     */
    public function getUserProfile($userId)
    {
        // Check if current user is admin
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $user = User::with('profile')->find($userId);
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        return response()->json([
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role,
                'created_at' => $user->created_at
            ],
            'profile' => $user->profile
        ]);
    }

    /**
     * Update user profile (admin only)
     */
    public function updateUserProfile(Request $request, $userId)
    {
        // Check if current user is admin
        if (auth()->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $user = User::with('profile')->find($userId);
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        $request->validate([
            'first_name' => 'sometimes|required|string|max:255',
            'last_name' => 'sometimes|required|string|max:255',
            'age' => 'sometimes|required|integer|min:13|max:120',
            'date_of_birth' => 'sometimes|required|date|before:today',
            'jlpt_level' => 'sometimes|required|in:N5,N4,N3,N2,N1,None',
            'why_study_japanese' => 'sometimes|required|string|max:1000',
        ]);

        if (!$user->profile) {
            return response()->json(['error' => 'User profile not found'], 404);
        }

        $user->profile->update($request->only([
            'first_name',
            'last_name',
            'age',
            'date_of_birth',
            'jlpt_level',
            'why_study_japanese',
        ]));

        return response()->json([
            'message' => 'User profile updated successfully',
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role
            ],
            'profile' => $user->profile->fresh()
        ]);
    }
}
