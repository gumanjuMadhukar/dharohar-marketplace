<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\WholesalePrice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /**
     * Display a listing of products with filters
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['primaryImage', 'images', 'category', 'store', 'activeAuction'])
            ->active();

        // Search
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('short_description', 'like', "%{$search}%");
            });
        }

        // Category filter
        if ($category = $request->query('category')) {
            $query->whereHas('category', function ($q) use ($category) {
                if (is_numeric($category)) {
                    $q->where('id', (int)$category)->orWhere('slug', $category);
                } else {
                    $q->where('slug', $category);
                }
            });
        }

        // Store filter
        if ($store = $request->query('store_id')) {
            $query->where('store_id', $store);
        }

        // Product type (physical, digital, idea, proposal)
        if ($type = $request->query('type')) {
            $query->where('type', $type);
        }

        // Badges & Special Attributes
        if ($request->boolean('student_made')) {
            $query->studentMade();
        }
        if ($request->boolean('handmade')) {
            $query->handmade();
        }
        if ($request->boolean('eco_friendly')) {
            $query->ecoFriendly();
        }
        if ($request->boolean('featured')) {
            $query->featured();
        }

        // Price range
        if ($minPrice = $request->query('min_price')) {
            $query->where('price', '>=', (float)$minPrice);
        }
        if ($maxPrice = $request->query('max_price')) {
            $query->where('price', '<=', (float)$maxPrice);
        }

        // Sorting
        $sort = $request->query('sort', 'newest');
        match ($sort) {
            'price_asc' => $query->orderBy('price', 'asc'),
            'price_desc' => $query->orderBy('price', 'desc'),
            'rating' => $query->orderBy('avg_rating', 'desc'),
            'popular' => $query->orderBy('sales_count', 'desc'),
            default => $query->latest(),
        };

        $products = $query->paginate($request->query('per_page', 16));

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

    /**
     * Display a specific product by slug or id
     */
    public function show(string $slugOrId): JsonResponse
    {
        $query = Product::with([
            'primaryImage',
            'images',
            'variants',
            'wholesalePrices',
            'category',
            'store.owner',
            'reviews.user' => fn($q) => $q->latest()->take(5),
            'auctions' => fn($q) => $q->where('status', 'active'),
            'activeAuction.bids.user' => fn($q) => $q->select('id', 'name', 'avatar'),
        ]);

        if (is_numeric($slugOrId)) {
            $product = $query->where(function ($q) use ($slugOrId) {
                $q->where('id', (int)$slugOrId)->orWhere('slug', $slugOrId);
            })->firstOrFail();
        } else {
            $product = $query->where('slug', $slugOrId)->firstOrFail();
        }

        // Increment views safely without touching updated_at timestamp
        try {
            $product->timestamps = false;
            $product->increment('views_count');
        } catch (\Throwable $e) {
            // view count increment failure should never block product view
        }

        return response()->json([
            'success' => true,
            'product' => $product,
        ]);
    }

    /**
     * Create product for store
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'store_id' => 'required|exists:stores,id',
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'short_description' => 'nullable|string|max:500',
            'type' => 'required|in:physical,digital,idea,proposal',
            'price' => 'required|numeric|min:0',
            'compare_price' => 'nullable|numeric|min:0',
            'cost_price' => 'nullable|numeric|min:0',
            'sku' => 'nullable|string|max:100',
            'quantity' => 'required|integer|min:0',
            'low_stock_threshold' => 'nullable|integer|min:1',
            'is_handmade' => 'nullable|boolean',
            'is_eco_friendly' => 'nullable|boolean',
            'is_student_made' => 'nullable|boolean',
            'tags' => 'nullable|array',
            'images' => 'nullable|array',
            'variants' => 'nullable|array',
            'wholesale_prices' => 'nullable|array',
        ]);

        // Check ownership or store manager
        $store = $user->stores()->find($validated['store_id']);
        if (!$store && !$user->managedStores()->where('stores.id', $validated['store_id'])->exists() && !$user->hasRole('admin')) {
            return response()->json(['success' => false, 'message' => 'Unauthorized for this store.'], 403);
        }

        // If user is student creator, automatically badge is_student_made
        if ($user->account_type === 'student') {
            $validated['is_student_made'] = true;
        }

        $validated['slug'] = Str::slug($validated['name']) . '-' . uniqid();
        $validated['is_active'] = true;

        $product = Product::create($validated);

        // Images
        if (!empty($validated['images'])) {
            foreach ($validated['images'] as $index => $img) {
                ProductImage::create([
                    'product_id' => $product->id,
                    'url' => is_string($img) ? $img : ($img['url'] ?? ''),
                    'alt_text' => $product->name,
                    'sort_order' => $index,
                    'is_primary' => $index === 0,
                ]);
            }
        }

        // Variants
        if (!empty($validated['variants'])) {
            foreach ($validated['variants'] as $v) {
                ProductVariant::create([
                    'product_id' => $product->id,
                    'name' => $v['name'],
                    'sku' => $v['sku'] ?? ($product->sku . '-' . Str::slug($v['name'])),
                    'price' => $v['price'] ?? $product->price,
                    'quantity' => $v['quantity'] ?? $product->quantity,
                    'attributes' => $v['attributes'] ?? [],
                ]);
            }
        }

        // Wholesale prices
        if (!empty($validated['wholesale_prices'])) {
            foreach ($validated['wholesale_prices'] as $wp) {
                WholesalePrice::create([
                    'product_id' => $product->id,
                    'min_quantity' => $wp['min_quantity'],
                    'max_quantity' => $wp['max_quantity'] ?? null,
                    'price' => $wp['price'],
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Product published successfully!',
            'product' => $product->load(['images', 'variants', 'wholesalePrices']),
        ], 201);
    }

    /**
     * Update product
     */
    public function update(Request $request, Product $product): JsonResponse
    {
        $user = $request->user();
        if ($product->store->user_id !== $user->id && !$user->hasRole('admin')) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'short_description' => 'nullable|string|max:500',
            'type' => 'sometimes|in:physical,digital,idea,proposal',
            'price' => 'sometimes|numeric|min:0',
            'compare_price' => 'nullable|numeric|min:0',
            'quantity' => 'sometimes|integer|min:0',
            'is_active' => 'sometimes|boolean',
            'is_featured' => 'sometimes|boolean',
            'is_handmade' => 'sometimes|boolean',
            'is_eco_friendly' => 'sometimes|boolean',
            'is_student_made' => 'sometimes|boolean',
            'tags' => 'nullable|array',
        ]);

        $product->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully.',
            'product' => $product->fresh(['images', 'variants', 'wholesalePrices']),
        ]);
    }

    /**
     * Delete product
     */
    public function destroy(Request $request, Product $product): JsonResponse
    {
        $user = $request->user();
        if ($product->store->user_id !== $user->id && !$user->hasRole('admin')) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully.',
        ]);
    }
}
