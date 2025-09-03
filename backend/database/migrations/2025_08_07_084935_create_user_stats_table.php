<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('user_stats', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            
            // Content type to separate stats
            $table->enum('content_type', ['custom_decks', 'provided_decks', 'kana_practice', 'jlpt_decks'])->default('custom_decks');
            
            // Memory test stats
            $table->integer('memory_score')->default(0);
            $table->integer('memory_total')->default(0);
            
            // Pronunciation test stats
            $table->integer('pronunciation_score')->default(0);
            $table->integer('pronunciation_total')->default(0);
            
            // Listening test stats
            $table->integer('listening_score')->default(0);
            $table->integer('listening_total')->default(0);
            
            // View words stats (how many times user viewed words)
            $table->integer('view_words_count')->default(0);
            
            // Quiz stats (JSON)
            $table->json('quiz_results_provided')->nullable();
            $table->json('quiz_results_ai')->nullable();
            $table->json('quiz_highscores')->nullable();
            
            // Word mastery stats (JSON)
            $table->json('word_mastery_stats')->nullable();
            
            // Lesson completion (JSON)
            $table->json('completed_lessons')->nullable();
            
            // Deck progress (JSON)
            $table->json('deck_progress')->nullable();
            
            $table->timestamps();
            
            // Ensure one stats record per user per content type
            $table->unique(['user_id', 'content_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_stats');
    }
};
