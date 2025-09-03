<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('words', function (Blueprint $table) {
            $table->json('embedding')->nullable(); // store as JSON
        });
    }
    
    public function down()
    {
        Schema::table('words', function (Blueprint $table) {
            $table->dropColumn('embedding');
        });
    }    
};
