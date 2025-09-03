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
        Schema::table('decks', function (Blueprint $table) {
            // Add missing columns to existing decks table
            if (!Schema::hasColumn('decks', 'slug')) {
                $table->string('slug')->unique()->after('name');
            }
            if (!Schema::hasColumn('decks', 'jlpt_level')) {
                $table->string('jlpt_level')->nullable()->after('description');
            }
            if (!Schema::hasColumn('decks', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('jlpt_level');
            }
            if (!Schema::hasColumn('decks', 'word_count')) {
                $table->integer('word_count')->default(0)->after('is_active');
            }
        });

        // Add indexes separately to avoid conflicts
        Schema::table('decks', function (Blueprint $table) {
            if (!$this->indexExists('decks', 'decks_jlpt_level_index')) {
                $table->index('jlpt_level');
            }
            if (!$this->indexExists('decks', 'decks_is_active_index')) {
                $table->index('is_active');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('decks', function (Blueprint $table) {
            $table->dropIndex(['jlpt_level']);
            $table->dropIndex(['is_active']);
            $table->dropColumn(['slug', 'jlpt_level', 'is_active', 'word_count']);
        });
    }

    /**
     * Check if an index exists
     */
    private function indexExists($table, $index)
    {
        $indexes = \DB::select("SHOW INDEX FROM {$table}");
        return collect($indexes)->contains('Key_name', $index);
    }
}; 