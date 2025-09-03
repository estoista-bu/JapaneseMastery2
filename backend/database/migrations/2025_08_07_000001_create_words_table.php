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
        Schema::create('words', function (Blueprint $table) {
            $table->id();
            $table->string('japanese')->unique();
            $table->string('reading')->nullable();
            $table->string('english');
            $table->string('jlpt_level')->nullable(); // N5, N4, N3, N2, N1
            $table->text('example_sentence')->nullable();
            $table->string('part_of_speech')->nullable(); // noun, verb, adjective, etc.
            $table->timestamps();
            
            // Indexes for better performance
            $table->index('jlpt_level');
            $table->index(['japanese', 'reading']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('words');
    }
}; 