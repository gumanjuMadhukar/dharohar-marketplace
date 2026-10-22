<?php

namespace Modules\Product\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::with(['primaryImage', 'images', 'category', 'store'])->active();

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($category = $request->query('category')) {
            $query->whereHas('category', function ($q) use ($category) {
                $q->where('slug', $category)->orWhere('id', $category);
            });
        }

        if ($type = $request->query('type')) {
            $query->where('type', $type);
        }

        if ($request->boolean('student_made')) $query->studentMade();
        if ($request->boolean('handmade')) $query->handmade();
        if ($request->boolean('eco_friendly')) $query->ecoFriendly();
        if ($request->boolean('featured')) $query->featured();

        if ($min = $request->query('min_price')) $query->where('price', '>=', (float)$min);
        if ($max = $request->query('max_price')) $query->where('price', '<=', (float)$max);

        $products = $query->latest()->paginate($request->query('per_page', 16));

        return response()->json(['success' => true, 'data' => $products]);
    }

    public function show(string $slugOrId): JsonResponse
    {
        $product = Product::with(['images', 'variants', 'wholesalePrices', 'category', 'store.owner', 'reviews.user'])
            ->where('slug', $slugOrId)
            ->orWhere('id', $slugOrId)
            ->firstOrFail();

        $product->increment('views_count');

        return response()->json(['success' => true, 'product' => $product]);
    }

    public function categories(): JsonResponse
    {
        $categories = Category::roots()->with('children')->withCount('products')->active()->get();
        return response()->json(['success' => true, 'data' => $categories]);
    }
}
