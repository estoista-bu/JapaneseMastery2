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
        Schema::create('kanas', function (Blueprint $table) {
            $table->id();
            $table->string('character'); // The kana character (e.g., あ, ア)
            $table->string('romaji'); // Romanized pronunciation (e.g., a, ka)
            $table->enum('type', ['hiragana', 'katakana']);
            $table->string('category')->nullable(); // Basic, dakuten, handakuten, etc.
            $table->integer('order')->default(0); // For ordering in practice
            $table->timestamps();
            
            // Ensure unique characters
            $table->unique('character');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kanas');
    }
};
