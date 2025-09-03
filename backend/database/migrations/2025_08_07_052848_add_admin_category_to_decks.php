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
        // First, we need to modify the enum to include 'admin'
        // Since MySQL doesn't support adding values to ENUM directly, we'll recreate the column
        Schema::table('decks', function (Blueprint $table) {
            // Drop the existing category column
            $table->dropColumn('category');
        });

        Schema::table('decks', function (Blueprint $table) {
            // Recreate the category column with the new enum values
            $table->enum('category', ['user', 'kana', 'group', 'jlpt', 'admin'])->default('user')->after('description');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('decks', function (Blueprint $table) {
            // Drop the category column
            $table->dropColumn('category');
        });

        Schema::table('decks', function (Blueprint $table) {
            // Recreate the category column with the original enum values
            $table->enum('category', ['user', 'kana', 'group', 'jlpt'])->default('user')->after('description');
        });
    }
};
