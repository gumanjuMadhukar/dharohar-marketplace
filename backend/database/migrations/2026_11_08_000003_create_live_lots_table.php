<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('live_lots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('live_room_id')->constrained('live_rooms')->cascadeOnDelete();
            $table->foreignId('product_id')->nullable()->constrained('products')->nullOnDelete();
            $table->unsignedInteger('lot_number')->default(1);
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('image_url')->nullable();
            $table->decimal('starting_price', 12, 2);
            $table->decimal('reserve_price', 12, 2)->nullable();
            $table->decimal('current_price', 12, 2);
            $table->decimal('bid_increment', 12, 2)->default(500.00);
            $table->foreignId('highest_bidder_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('status', ['pending', 'active', 'hammered', 'passed'])->default('pending');
            $table->timestamp('ends_at')->nullable();
            $table->timestamps();

            $table->index(['live_room_id', 'status']);
            $table->index('lot_number');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('live_lots');
    }
};
