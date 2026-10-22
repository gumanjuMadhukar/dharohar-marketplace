<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(int $productId): JsonResponse
    {
        $reviews = Review::where('product_id', $productId)
            ->where('is_approved', true)
            ->with('user:id,name,avatar')
            ->latest()
            ->paginate(10);

        return response()->json([
            'success' => true,
            'data' => $reviews,
        ]);
    }

    public function store(Request $request, int $productId): JsonResponse
    {
        $user = $request->user();
        $product = Product::findOrFail($productId);

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'nullable|string|max:255',
            'comment' => 'required|string|max:2000',
            'images' => 'nullable|array',
        ]);

        // Check if verified purchase
        $isVerifiedPurchase = Order::where('user_id', $user->id)
            ->where('status', 'delivered')
            ->whereHas('items', fn($q) => $q->where('product_id', $productId))
            ->exists();

        $review = Review::updateOrCreate(
            ['user_id' => $user->id, 'product_id' => $product->id],
            [
                'rating' => $validated['rating'],
                'title' => $validated['title'] ?? null,
                'comment' => $validated['comment'],
                'images' => $validated['images'] ?? null,
                'is_verified_purchase' => $isVerifiedPurchase,
                'is_approved' => true,
            ]
        );

        // Recalculate average rating for product
        $avg = Review::where('product_id', $product->id)->where('is_approved', true)->avg('rating');
        $product->update(['avg_rating' => round($avg, 2)]);

        return response()->json([
            'success' => true,
            'message' => 'Review submitted successfully!',
            'review' => $review->load('user:id,name,avatar'),
        ], 201);
    }
}

