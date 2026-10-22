<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Bid extends Model
{
    protected $fillable = [
        'auction_id',
        'user_id',
        'amount',
        'max_amount',
        'is_auto',
        'ip_address',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'max_amount' => 'decimal:2',
            'is_auto' => 'boolean',
        ];
    }

    public function auction(): BelongsTo
    {
        return $this->belongsTo(Auction::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
