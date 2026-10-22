<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'store_id',
        'category_id',
        'name',
        'slug',
        'description',
        'short_description',
        'type',
        'price',
        'compare_price',
        'cost_price',
        'sku',
        'barcode',
        'quantity',
        'low_stock_threshold',
        'weight',
        'dimensions',
        'is_active',
        'is_featured',
        'is_handmade',
        'is_eco_friendly',
        'is_student_made',
        'tags',
        'meta_title',
        'meta_description',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'compare_price' => 'decimal:2',
            'cost_price' => 'decimal:2',
            'weight' => 'decimal:2',
            'dimensions' => 'array',
            'tags' => 'array',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'is_handmade' => 'boolean',
            'is_eco_friendly' => 'boolean',
            'is_student_made' => 'boolean',
            'quantity' => 'integer',
            'low_stock_threshold' => 'integer',
            'views_count' => 'integer',
            'sales_count' => 'integer',
            'avg_rating' => 'decimal:2',
        ];
    }

    // ── Scopes ────────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeHandmade($query)
    {
        return $query->where('is_handmade', true);
    }

    public function scopeEcoFriendly($query)
    {
        return $query->where('is_eco_friendly', true);
    }

    public function scopeStudentMade($query)
    {
        return $query->where('is_student_made', true);
    }

    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeLowStock($query)
    {
        return $query->whereColumn('quantity', '<=', 'low_stock_threshold');
    }

    public function scopeInStock($query)
    {
        return $query->where('quantity', '>', 0);
    }

    // ── Relationships ─────────────────────────────────────

    protected $appends = [
        'is_in_active_auction',
    ];

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function primaryImage()
    {
        return $this->hasOne(ProductImage::class)->where('is_primary', true);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function wishlists(): HasMany
    {
        return $this->hasMany(Wishlist::class);
    }

    public function auctions(): HasMany
    {
        return $this->hasMany(Auction::class);
    }

    public function activeAuction()
    {
        return $this->hasOne(Auction::class)
            ->where('status', 'active')
            ->where('starts_at', '<=', now())
            ->where('ends_at', '>', now())
            ->latestOfMany();
    }

    public function getIsInActiveAuctionAttribute(): bool
    {
        if ($this->relationLoaded('activeAuction')) {
            return !is_null($this->activeAuction);
        }
        if ($this->relationLoaded('auctions')) {
            return $this->auctions->contains(function ($a) {
                return $a->status === 'active' && $a->starts_at <= now() && $a->ends_at > now();
            });
        }
        return false;
    }

    public function wholesalePrices(): HasMany
    {
        return $this->hasMany(WholesalePrice::class)->orderBy('min_quantity');
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}

