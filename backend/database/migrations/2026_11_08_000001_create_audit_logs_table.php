<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('role')->default('guest');
            $table->string('action'); // e.g., 'USER_BANNED', 'KYC_APPROVED', 'LOT_HAMMERED', 'STREAM_STARTED'
            $table->string('entity_type')->nullable(); // e.g., 'User', 'LiveLot', 'KycDocument'
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->text('details')->nullable();
            $table->string('hmac_hash')->nullable();
            $table->timestamps();

            $table->index(['action', 'created_at']);
            $table->index('user_id');
            $table->index(['entity_type', 'entity_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
