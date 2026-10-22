<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = Category::roots()
            ->with(['children' => fn($q) => $q->active()->withCount('products')])
            ->withCount('products')
            ->active()
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }

    public function show(string $slug): JsonResponse
    {
        $category = Category::where('slug', $slug)
            ->with(['children', 'products' => fn($q) => $q->active()->with('primaryImage')->take(20)])
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'category' => $category,
        ]);
    }
}
