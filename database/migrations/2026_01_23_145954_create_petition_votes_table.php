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
        Schema::create('petition_votes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('petition_id');
            $table->foreign('petition_id')
                ->references('petition_id')
                ->on('petitions')
                ->onDelete('cascade');
            $table->string('full_name');
            $table->date('voted_at');
            $table->timestamps();
            $table->unique(['petition_id', 'full_name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('petition_votes');
    }
};
