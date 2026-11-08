<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('live_rooms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('host_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('store_id')->nullable()->constrained('stores')->nullOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('category')->default('Heritage Craft');
            $table->string('cover_image')->nullable();
            $table->string('stream_url')->nullable();
            $table->string('stream_key')->nullable();
            $table->enum('status', ['scheduled', 'live', 'ended', 'paused'])->default('scheduled');
            $table->unsignedBigInteger('current_lot_id')->nullable();
            $table->unsignedInteger('viewer_count')->default(0);
            $table->unsignedInteger('likes_count')->default(0);
            $table->unsignedInteger('shares_count')->default(0);
            $table->boolean('chat_enabled')->default(true);
            $table->unsignedInteger('slow_mode_seconds')->default(3);
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('host_id');
            $table->index('scheduled_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('live_rooms');
    }
};
