<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LiveLot extends Model
{
    use HasFactory;

    protected $fillable = [
        'live_room_id',
        'product_id',
        'lot_number',
        'title',
        'description',
        'image_url',
        'starting_price',
        'reserve_price',
        'current_price',
        'bid_increment',
        'highest_bidder_id',
        'status',
        'ends_at',
    ];

    protected function casts(): array
    {
        return [
            'lot_number' => 'integer',
            'starting_price' => 'decimal:2',
            'reserve_price' => 'decimal:2',
            'current_price' => 'decimal:2',
            'bid_increment' => 'decimal:2',
            'ends_at' => 'datetime',
        ];
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(LiveRoom::class, 'live_room_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function highestBidder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'highest_bidder_id');
    }
}
