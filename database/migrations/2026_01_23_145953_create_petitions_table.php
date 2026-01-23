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
        Schema::create('petitions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('petition_id')->unique();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('author');
            $table->integer('votes_count')->default(0);
            $table->date('published_at');
            $table->integer('total_pages')->default(0);
            $table->integer('processed_pages')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('petitions');
    }
};
