<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('auctions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('store_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('starting_price', 10, 2);
            $table->decimal('reserve_price', 10, 2)->nullable();
            $table->decimal('current_price', 10, 2);
            $table->decimal('bid_increment', 10, 2)->default(1.00);
            $table->timestamp('starts_at');
            $table->timestamp('ends_at');
            $table->enum('status', ['draft', 'upcoming', 'active', 'ended', 'cancelled'])->default('draft');
            $table->foreignId('winner_id')->nullable()->constrained('users')->nullOnDelete();
            $table->boolean('auto_extend')->default(true);
            $table->unsignedInteger('extend_minutes')->default(5);
            $table->timestamps();

            $table->index('status');
            $table->index(['starts_at', 'ends_at']);
            $table->index('store_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('auctions');
    }
};

