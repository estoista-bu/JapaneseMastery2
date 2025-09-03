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
        Schema::table('words', function (Blueprint $table) {
            // Add composite unique constraint for exact duplicates
            // This ensures only exact duplicates (same japanese + reading + english) are prevented
            $table->unique(['japanese', 'reading', 'english'], 'unique_exact_word');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('words', function (Blueprint $table) {
            // Remove the composite unique constraint
            $table->dropUnique('unique_exact_word');
        });
    }
};
