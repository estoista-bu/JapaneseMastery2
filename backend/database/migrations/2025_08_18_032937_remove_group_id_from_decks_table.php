<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop the pivot table first since it references user_group
        Schema::dropIfExists('group_members');

        // Remove the group_id column from decks table if it exists
        if (Schema::hasColumn('decks', 'group_id')) {
            Schema::table('decks', function (Blueprint $table) {
                $table->dropForeign(['group_id']);
                $table->dropColumn('group_id');
            });
        }

        // Clear the user_group table since it wasn't being used
        DB::table('user_group')->truncate();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Add back the group_id column to decks table
        Schema::table('decks', function (Blueprint $table) {
            $table->foreignId('group_id')->nullable()->constrained('user_group')->onDelete('set null');
        });

        // Recreate the pivot table
        Schema::create('group_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_group_id')->constrained('user_group')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            // Prevent duplicate user-group combinations
            $table->unique(['user_group_id', 'user_id']);
        });
    }
};
