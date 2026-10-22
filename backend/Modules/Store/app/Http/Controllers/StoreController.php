<?php

namespace Modules\Store\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Store;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StoreController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $stores = Store::active()->with('owner')->withCount('products')->paginate(12);
        return response()->json(['success' => true, 'data' => $stores]);
    }

    public function show(string $slug): JsonResponse
    {
        $store = Store::with('owner')->where('slug', $slug)->orWhere('id', $slug)->firstOrFail();
        $products = $store->products()->active()->with('primaryImage')->latest()->paginate(12);
        return response()->json(['success' => true, 'store' => $store, 'products' => $products]);
    }
}
