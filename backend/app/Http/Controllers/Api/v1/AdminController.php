<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Auction;
use App\Models\Bid;
use App\Models\Dispute;
use App\Models\KycDocument;
use App\Models\Order;
use App\Models\PlatformSetting;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Store;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminController extends Controller
{
    /**
     * Platform Analytics & Metrics
     */
    public function stats(Request $request): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $totalGmv = Order::where('payment_status', 'paid')->sum('total');
        $totalOrders = Order::count();
        $totalUsers = User::count();
        $totalStores = Store::count();
        $verifiedStores = Store::where('is_verified', true)->count();
        $studentCreators = User::where('account_type', 'student')->count();
        $activeAuctions = Auction::where('status', 'active')->count();
        $pendingKyc = KycDocument::where('status', 'pending')->count();
        $openDisputes = Dispute::where('status', 'open')->count();

        return response()->json([
            'success' => true,
            'stats' => [
                'total_gmv' => (float)$totalGmv,
                'total_orders' => $totalOrders,
                'total_users' => $totalUsers,
                'total_stores' => $totalStores,
                'verified_stores' => $verifiedStores,
                'student_creators' => $studentCreators,
                'active_auctions' => $activeAuctions,
                'pending_kyc' => $pendingKyc,
                'open_disputes' => $openDisputes,
            ],
        ]);
    }

    /**
     * List KYC verification requests
     */
    public function kycList(Request $request): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $status = $request->query('status', 'pending');
        $kycs = KycDocument::with('user:id,name,email,account_type,phone,guardian_name')
            ->when($status !== 'all', fn($q) => $q->where('status', $status))
            ->latest()
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $kycs,
        ]);
    }

    /**
     * Approve KYC
     */
    public function approveKyc(Request $request, int $id): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $kyc = KycDocument::findOrFail($id);
        $kyc->update([
            'status' => 'approved',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        $kyc->user->update(['is_verified' => true]);

        return response()->json([
            'success' => true,
            'message' => 'KYC approved and user verified successfully.',
            'kyc' => $kyc,
        ]);
    }

    /**
     * Reject KYC
     */
    public function rejectKyc(Request $request, int $id): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $kyc = KycDocument::findOrFail($id);
        $kyc->update([
            'status' => 'rejected',
            'rejection_reason' => $validated['reason'],
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'KYC submission rejected.',
            'kyc' => $kyc,
        ]);
    }

    /**
     * Commission & Platform settings
     */
    public function getSettings(Request $request): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $settings = PlatformSetting::all()->pluck('value', 'key');

        return response()->json([
            'success' => true,
            'settings' => $settings,
        ]);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $validated = $request->validate([
            'platform_commission' => 'nullable|numeric|min:0|max:100',
            'student_commission' => 'nullable|numeric|min:0|max:100',
        ]);

        foreach ($validated as $key => $val) {
            if ($val !== null) {
                PlatformSetting::set($key, (string)$val);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Platform settings updated successfully.',
            'settings' => PlatformSetting::all()->pluck('value', 'key'),
        ]);
    }

    // ── Full User Management (CRUD) ──────────────────────────────
    public function indexUsers(Request $request): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $query = User::withCount('stores');

        if ($request->filled('q')) {
            $q = $request->query('q');
            $query->where(function ($sub) use ($q) {
                $sub->where('name', 'ilike', "%{$q}%")
                    ->orWhere('email', 'ilike', "%{$q}%")
                    ->orWhere('phone', 'ilike', "%{$q}%");
            });
        }

        if ($request->filled('role') && $request->query('role') !== 'all') {
            $query->where('account_type', $request->query('role'));
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->query('status') === 'active');
        }

        $users = $query->latest()->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $users,
        ]);
    }

    public function storeUser(Request $request): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'account_type' => 'required|in:admin,seller,manufacturer,student,customer',
            'phone' => 'nullable|string|max:20',
            'bio' => 'nullable|string|max:500',
            'is_verified' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $validated['password'] = \Illuminate\Support\Facades\Hash::make($validated['password']);
        $user = User::create($validated);

        try {
            $user->assignRole($validated['account_type']);
        } catch (\Throwable $e) {}

        return response()->json([
            'success' => true,
            'message' => 'User created successfully.',
            'user' => $user,
        ], 201);
    }

    public function updateUser(Request $request, int $id): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'account_type' => 'sometimes|in:admin,seller,manufacturer,student,customer',
            'phone' => 'nullable|string|max:20',
            'bio' => 'nullable|string|max:500',
            'is_verified' => 'boolean',
            'is_active' => 'boolean',
        ]);

        if ($request->filled('password')) {
            $validated['password'] = \Illuminate\Support\Facades\Hash::make($request->input('password'));
        }

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully.',
            'user' => $user,
        ]);
    }

    public function toggleBanUser(Request $request, int $id): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $user = User::findOrFail($id);
        if ($user->id === $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Cannot ban your own admin account.'], 400);
        }

        $user->update(['is_active' => !$user->is_active]);

        return response()->json([
            'success' => true,
            'message' => $user->is_active ? 'User activated successfully.' : 'User suspended / banned.',
            'is_active' => $user->is_active,
        ]);
    }

    public function deleteUser(Request $request, int $id): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $user = User::findOrFail($id);
        if ($user->id === $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Cannot delete your own admin account.'], 400);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully.',
        ]);
    }

    // ── Stores Management ────────────────────────────────────────
    public function indexStores(Request $request): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $stores = Store::with(['user:id,name,email,account_type'])
            ->withCount('products')
            ->when($request->filled('q'), function ($q) use ($request) {
                $search = $request->query('q');
                $q->where('name', 'ilike', "%{$search}%")->orWhere('email', 'ilike', "%{$search}%");
            })
            ->latest()
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $stores,
        ]);
    }

    public function updateStore(Request $request, int $id): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'city' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:150',
            'commission_rate' => 'nullable|numeric|min:0|max:100',
            'is_verified' => 'boolean',
            'is_active' => 'boolean',
            'description' => 'nullable|string',
        ]);

        $store = Store::findOrFail($id);
        $store->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Store profile and commission updated successfully.',
            'store' => $store->fresh(),
        ]);
    }

    public function deleteStore(Request $request, int $id): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $store = Store::findOrFail($id);
        $store->delete();

        return response()->json([
            'success' => true,
            'message' => 'Store successfully deleted.',
        ]);
    }

    public function toggleStoreVerify(Request $request, int $id): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $store = Store::findOrFail($id);
        $store->update(['is_verified' => !$store->is_verified]);

        return response()->json([
            'success' => true,
            'message' => $store->is_verified ? 'Store verified successfully.' : 'Store unverified.',
            'store' => $store,
        ]);
    }

    // ── Products Moderation & CRUD ──────────────────────────────
    public function indexProducts(Request $request): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $products = Product::with(['store:id,name', 'category:id,name', 'primaryImage'])
            ->when($request->filled('q'), function ($q) use ($request) {
                $search = $request->query('q');
                $q->where('name', 'ilike', "%{$search}%");
            })
            ->when($request->filled('category_id'), function ($q) use ($request) {
                $q->where('category_id', $request->query('category_id'));
            })
            ->latest()
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

    public function storeProduct(Request $request): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'store_id' => 'required|exists:stores,id',
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'compare_price' => 'nullable|numeric|min:0',
            'quantity' => 'required|integer|min:0',
            'type' => 'required|in:physical,digital,idea,proposal',
            'description' => 'required|string',
            'is_handmade' => 'boolean',
            'is_student_made' => 'boolean',
            'is_featured' => 'boolean',
            'is_eco_friendly' => 'boolean',
            'image_url' => 'nullable|url',
        ]);

        $slug = Str::slug($validated['name']) . '-' . Str::random(6);

        $product = Product::create([
            'store_id' => $validated['store_id'],
            'category_id' => $validated['category_id'],
            'name' => $validated['name'],
            'slug' => $slug,
            'price' => $validated['price'],
            'compare_price' => $validated['compare_price'] ?? null,
            'quantity' => $validated['quantity'],
            'type' => $validated['type'],
            'description' => $validated['description'],
            'is_handmade' => $validated['is_handmade'] ?? false,
            'is_student_made' => $validated['is_student_made'] ?? false,
            'is_featured' => $validated['is_featured'] ?? false,
            'is_eco_friendly' => $validated['is_eco_friendly'] ?? false,
            'is_active' => true,
        ]);

        if (!empty($validated['image_url'])) {
            ProductImage::create([
                'product_id' => $product->id,
                'url' => $validated['image_url'],
                'is_primary' => true,
                'sort_order' => 0,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Product published successfully to catalog.',
            'product' => $product->load(['store:id,name', 'category:id,name', 'primaryImage']),
        ], 201);
    }

    public function updateProduct(Request $request, int $id): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'store_id' => 'required|exists:stores,id',
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'compare_price' => 'nullable|numeric|min:0',
            'quantity' => 'required|integer|min:0',
            'type' => 'required|in:physical,digital,idea,proposal',
            'description' => 'required|string',
            'is_handmade' => 'boolean',
            'is_student_made' => 'boolean',
            'is_featured' => 'boolean',
            'is_eco_friendly' => 'boolean',
            'is_active' => 'boolean',
            'image_url' => 'nullable|url',
        ]);

        $product = Product::findOrFail($id);
        $product->update([
            'store_id' => $validated['store_id'],
            'category_id' => $validated['category_id'],
            'name' => $validated['name'],
            'price' => $validated['price'],
            'compare_price' => $validated['compare_price'] ?? null,
            'quantity' => $validated['quantity'],
            'type' => $validated['type'],
            'description' => $validated['description'],
            'is_handmade' => $validated['is_handmade'] ?? false,
            'is_student_made' => $validated['is_student_made'] ?? false,
            'is_featured' => $validated['is_featured'] ?? false,
            'is_eco_friendly' => $validated['is_eco_friendly'] ?? false,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        if (!empty($validated['image_url'])) {
            ProductImage::updateOrCreate(
                ['product_id' => $product->id, 'is_primary' => true],
                ['url' => $validated['image_url'], 'sort_order' => 0]
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully.',
            'product' => $product->load(['store:id,name', 'category:id,name', 'primaryImage']),
        ]);
    }

    public function toggleProductFeature(Request $request, int $id): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $product = Product::findOrFail($id);
        $product->update(['is_featured' => !$product->is_featured]);

        return response()->json([
            'success' => true,
            'message' => $product->is_featured ? 'Product featured on homepage.' : 'Product unfeatured.',
            'is_featured' => $product->is_featured,
        ]);
    }

    public function deleteProduct(Request $request, int $id): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product removed from platform.',
        ]);
    }

    // ── Auctions Moderation & CRUD ──────────────────────────────
    public function indexAuctions(Request $request): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $auctions = Auction::with(['product.primaryImage', 'store:id,name'])
            ->withCount('bids')
            ->when($request->filled('q'), function ($q) use ($request) {
                $search = $request->query('q');
                $q->where('title', 'ilike', "%{$search}%");
            })
            ->latest()
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $auctions,
        ]);
    }

    public function storeAuction(Request $request): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'product_id' => 'required|exists:products,id',
            'store_id' => 'required|exists:stores,id',
            'starting_price' => 'required|numeric|min:1',
            'reserve_price' => 'nullable|numeric|min:0',
            'bid_increment' => 'required|numeric|min:10',
            'starts_at' => 'nullable|date',
            'ends_at' => 'required|date',
            'status' => 'nullable|in:upcoming,active',
        ]);

        $auction = Auction::create([
            'title' => $validated['title'],
            'product_id' => $validated['product_id'],
            'store_id' => $validated['store_id'],
            'starting_price' => $validated['starting_price'],
            'current_price' => $validated['starting_price'],
            'reserve_price' => $validated['reserve_price'] ?? null,
            'bid_increment' => $validated['bid_increment'],
            'starts_at' => $validated['starts_at'] ?? now(),
            'ends_at' => $validated['ends_at'],
            'status' => $validated['status'] ?? 'active',
            'auto_extend' => true,
            'extend_minutes' => 5,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Live auction created successfully.',
            'auction' => $auction->load(['product.primaryImage', 'store:id,name']),
        ], 201);
    }

    public function updateAuction(Request $request, int $id): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'starting_price' => 'required|numeric|min:1',
            'reserve_price' => 'nullable|numeric|min:0',
            'bid_increment' => 'required|numeric|min:10',
            'ends_at' => 'required|date',
            'status' => 'required|in:upcoming,active,ended,cancelled',
        ]);

        $auction = Auction::findOrFail($id);
        $auction->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Auction updated successfully.',
            'auction' => $auction->load(['product.primaryImage', 'store:id,name']),
        ]);
    }

    public function deleteAuction(Request $request, int $id): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $auction = Auction::findOrFail($id);
        $auction->delete();

        return response()->json([
            'success' => true,
            'message' => 'Auction deleted successfully.',
        ]);
    }

    public function auctionBids(Request $request, int $id): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $bids = Bid::with('user:id,name,email,avatar')
            ->where('auction_id', $id)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'bids' => $bids,
        ]);
    }

    public function updateAuctionStatus(Request $request, int $id): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $validated = $request->validate([
            'status' => 'required|in:active,ended,cancelled',
        ]);

        $auction = Auction::findOrFail($id);
        $auction->update(['status' => $validated['status']]);

        return response()->json([
            'success' => true,
            'message' => "Auction status updated to {$validated['status']}.",
            'auction' => $auction,
        ]);
    }

    // ── Platform Orders ──────────────────────────────────────────
    public function indexOrders(Request $request): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $orders = Order::with(['user:id,name,email,phone', 'items.store:id,name', 'items.product.primaryImage'])
            ->when($request->filled('q'), function ($q) use ($request) {
                $search = $request->query('q');
                $q->where('order_number', 'ilike', "%{$search}%")
                    ->orWhere('shipping_name', 'ilike', "%{$search}%");
            })
            ->latest()
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }

    public function showOrder(Request $request, int $id): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $order = Order::with([
            'user:id,name,email,phone',
            'items.store:id,name,phone,email',
            'items.product.primaryImage',
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'order' => $order,
        ]);
    }

    public function updateOrderStatus(Request $request, int $id): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $validated = $request->validate([
            'shipping_status' => 'nullable|in:pending,processing,shipped,delivered,cancelled',
            'payment_status' => 'nullable|in:pending,paid,failed,refunded',
            'tracking_number' => 'nullable|string|max:100',
        ]);

        $order = Order::findOrFail($id);
        $order->update(array_filter($validated));

        return response()->json([
            'success' => true,
            'message' => 'Order updated successfully.',
            'order' => $order,
        ]);
    }

    public function updateOrderTracking(Request $request, int $id): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $validated = $request->validate([
            'tracking_number' => 'required|string|max:100',
            'notes' => 'nullable|string|max:500',
        ]);

        $order = Order::findOrFail($id);
        $order->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Tracking information updated.',
            'order' => $order,
        ]);
    }

    // ── Disputes Management ──────────────────────────────────────
    public function indexDisputes(Request $request): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $disputes = Dispute::with(['order', 'raisedBy:id,name,email', 'againstUser:id,name,email'])
            ->latest()
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $disputes,
        ]);
    }

    public function resolveDispute(Request $request, int $id): JsonResponse
    {
        $this->ensureAdmin($request->user());

        $validated = $request->validate([
            'resolution' => 'required|string|max:1000',
            'status' => 'required|in:resolved,rejected',
        ]);

        $dispute = Dispute::findOrFail($id);
        $dispute->update([
            'status' => $validated['status'],
            'resolution' => $validated['resolution'],
            'resolved_by' => $request->user()->id,
            'resolved_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Dispute updated successfully.',
            'dispute' => $dispute,
        ]);
    }

    protected function ensureAdmin(User $user): void
    {
        if ($user->account_type !== 'admin' && !$user->hasRole('admin')) {
            abort(403, 'Unauthorized. Administrator access required.');
        }
    }
}

