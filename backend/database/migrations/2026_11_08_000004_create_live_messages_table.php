<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('live_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('live_room_id')->constrained('live_rooms')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('user_name');
            $table->string('user_role')->default('customer');
            $table->text('message');
            $table->string('badge')->nullable();
            $table->boolean('is_pinned')->default(false);
            $table->boolean('is_system')->default(false);
            $table->timestamps();

            $table->index(['live_room_id', 'created_at']);
            $table->index('is_pinned');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('live_messages');
    }
};
