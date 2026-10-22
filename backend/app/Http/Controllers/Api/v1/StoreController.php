<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Store;
use App\Models\StoreManager;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class StoreController extends Controller
{
    /**
     * List active stores
     */
    public function index(Request $request): JsonResponse
    {
        $query = Store::active()->with('owner');

        if ($request->boolean('verified')) {
            $query->verified();
        }

        if ($search = $request->query('search')) {
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%");
        }

        $stores = $query->withCount(['products', 'followers'])
            ->orderBy('rating', 'desc')
            ->paginate($request->query('per_page', 12));

        return response()->json([
            'success' => true,
            'data' => $stores,
        ]);
    }

    /**
     * Show store storefront details
     */
    public function show(string $slug): JsonResponse
    {
        $query = Store::with(['owner'])
            ->withCount(['products', 'followers']);

        if (is_numeric($slug)) {
            $store = $query->where(function ($q) use ($slug) {
                $q->where('id', (int)$slug)->orWhere('slug', $slug);
            })->firstOrFail();
        } else {
            $store = $query->where('slug', $slug)->firstOrFail();
        }

        $products = $store->products()
            ->active()
            ->with('primaryImage')
            ->latest()
            ->paginate(12);

        $auctions = $store->auctions()
            ->where('status', 'active')
            ->with('product.primaryImage')
            ->get();

        return response()->json([
            'success' => true,
            'store' => $store,
            'products' => $products,
            'auctions' => $auctions,
        ]);
    }

    /**
     * Create a new Store for current user
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:stores,name',
            'description' => 'required|string',
            'logo' => 'nullable|string',
            'banner' => 'nullable|string',
            'address' => 'required|string|max:255',
            'city' => 'required|string|max:100',
            'state' => 'required|string|max:100',
            'country' => 'nullable|string|max:100',
            'phone' => 'required|string|max:20',
            'email' => 'required|email|max:255',
            'website' => 'nullable|url',
            'policies' => 'nullable|string',
        ]);

        $validated['user_id'] = $user->id;
        $validated['slug'] = Str::slug($validated['name']);
        $validated['country'] = $validated['country'] ?? 'Nepal';
        $validated['is_active'] = true;
        $validated['is_verified'] = false;
        $validated['rating'] = 5.00;
        $validated['commission_rate'] = 10.00;

        $store = Store::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Store created successfully! Pending admin verification badge.',
            'store' => $store,
        ], 201);
    }

    /**
     * Update Store details
     */
    public function update(Request $request, Store $store): JsonResponse
    {
        $user = $request->user();
        if ($store->user_id !== $user->id && !$user->hasRole('admin')) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255|unique:stores,name,' . $store->id,
            'description' => 'sometimes|string',
            'logo' => 'nullable|string',
            'banner' => 'nullable|string',
            'address' => 'sometimes|string|max:255',
            'city' => 'sometimes|string|max:100',
            'state' => 'sometimes|string|max:100',
            'phone' => 'sometimes|string|max:20',
            'email' => 'sometimes|email|max:255',
            'website' => 'nullable|url',
            'policies' => 'nullable|string',
        ]);

        $store->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Store updated successfully.',
            'store' => $store,
        ]);
    }

    /**
     * Follow or Unfollow store
     */
    public function toggleFollow(Request $request, Store $store): JsonResponse
    {
        $user = $request->user();
        $isFollowing = $user->followedStores()->where('store_id', $store->id)->exists();

        if ($isFollowing) {
            $user->followedStores()->detach($store->id);
            $following = false;
        } else {
            $user->followedStores()->attach($store->id);
            $following = true;
        }

        return response()->json([
            'success' => true,
            'following' => $following,
            'followers_count' => $store->followers()->count(),
        ]);
    }

    /**
     * Invite store manager
     */
    public function inviteManager(Request $request, Store $store): JsonResponse
    {
        $user = $request->user();
        if ($store->user_id !== $user->id) {
            return response()->json(['success' => false, 'message' => 'Only the store owner can invite managers.'], 403);
        }

        $validated = $request->validate([
            'email' => 'required|email|exists:users,email',
            'permissions' => 'required|array',
        ]);

        $invitedUser = User::where('email', $validated['email'])->first();

        $manager = StoreManager::updateOrCreate(
            ['store_id' => $store->id, 'user_id' => $invitedUser->id],
            [
                'permissions' => $validated['permissions'],
                'invited_at' => now(),
                'accepted_at' => now(), // instant accept in demo
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Store manager invited successfully.',
            'manager' => $manager->load('user'),
        ]);
    }
}
