<?php

use App\Http\Controllers\Api\v1\AdminController;
use App\Http\Controllers\Api\v1\AuthController;
use App\Http\Controllers\Api\v1\ProductController;
use App\Http\Controllers\Api\v1\CategoryController;
use App\Http\Controllers\Api\v1\StoreController;
use App\Http\Controllers\Api\v1\AuctionController;
use App\Http\Controllers\Api\v1\OrderController;
use App\Http\Controllers\Api\v1\CartController;
use App\Http\Controllers\Api\v1\CouponController;
use App\Http\Controllers\Api\v1\KycController;
use App\Http\Controllers\Api\v1\ReviewController;
use App\Http\Controllers\Api\v1\SellerDashboardController;
use App\Http\Controllers\Api\v1\WishlistController;
use App\Models\Banner;
use App\Models\BlogPost;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Dharohar RESTful API v1
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // ── Public Routes ───────────────────────────────────────────
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);

    // Marketplace Products & Categories
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{slugOrId}', [ProductController::class, 'show']);
    Route::get('/products/{id}/reviews', [ReviewController::class, 'index']);
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{slug}', [CategoryController::class, 'show']);

    // Stores / Artisans / Student Creators
    Route::get('/stores', [StoreController::class, 'index']);
    Route::get('/stores/{slug}', [StoreController::class, 'show']);

    // Live Auction Hall
    Route::get('/auctions', [AuctionController::class, 'index']);
    Route::get('/auctions/{id}', [AuctionController::class, 'show']);

    // Public Order Tracking
    Route::post('/orders/track', [OrderController::class, 'track']);

    // Cart (User & Guest)
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/items', [CartController::class, 'addItem']);
    Route::put('/cart/items/{itemId}', [CartController::class, 'updateItem']);
    Route::delete('/cart/items/{itemId}', [CartController::class, 'removeItem']);
    Route::delete('/cart/clear', [CartController::class, 'clear']);

    // Coupons Validation
    Route::post('/coupons/validate', [CouponController::class, 'validateCoupon']);

    // Payment Gateway Verification Callback (eSewa / Khalti)
    Route::post('/payments/verify', function (Request $request, PaymentService $paymentService) {
        $gateway = $request->input('gateway', 'esewa');
        $success = $paymentService->verifyPayment($gateway, $request->all());
        return response()->json([
            'success' => $success,
            'message' => $success ? 'Payment verified successfully.' : 'Payment verification pending or failed.',
        ]);
    });

    // Banners & Blog / Resources
    Route::get('/banners', function () {
        return response()->json([
            'success' => true,
            'banners' => Banner::active()->orderBy('sort_order')->get(),
        ]);
    });

    Route::get('/blog', function () {
        return response()->json([
            'success' => true,
            'posts' => BlogPost::published()->latest()->paginate(10),
        ]);
    });

    // ── Protected Routes (Sanctum) ──────────────────────────────
    Route::middleware('auth:sanctum')->group(function () {
        // User profile & auth
        Route::get('/auth/user', [AuthController::class, 'user']);
        Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
        Route::post('/auth/password', [AuthController::class, 'changePassword']);
        Route::get('/auth/bids', [AuthController::class, 'myBids']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        // Wishlist
        Route::get('/wishlist', [WishlistController::class, 'index']);
        Route::post('/wishlist/toggle', [WishlistController::class, 'toggle']);

        // Reviews
        Route::post('/products/{id}/reviews', [ReviewController::class, 'store']);

        // Orders & Checkout
        Route::get('/orders', [OrderController::class, 'index']);
        Route::get('/orders/{orderNumber}', [OrderController::class, 'show']);
        Route::post('/checkout', [OrderController::class, 'store']);

        // Live Bidding
        Route::post('/auctions/{id}/bid', [AuctionController::class, 'bid']);

        // Seller & Creator Operations
        Route::post('/stores', [StoreController::class, 'store']);
        Route::put('/stores/{store}', [StoreController::class, 'update']);
        Route::post('/stores/{store}/follow', [StoreController::class, 'toggleFollow']);
        Route::post('/stores/{store}/managers', [StoreController::class, 'inviteManager']);

        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{product}', [ProductController::class, 'update']);
        Route::delete('/products/{product}', [ProductController::class, 'destroy']);

        // Create new timed auction
        Route::post('/auctions', [AuctionController::class, 'store']);

        // Seller Dashboard & Complete Store Operations
        Route::get('/seller/stats', [SellerDashboardController::class, 'stats']);
        Route::get('/seller/store', [SellerDashboardController::class, 'getStore']);
        Route::put('/seller/store', [SellerDashboardController::class, 'updateStore']);
        Route::get('/seller/products', [SellerDashboardController::class, 'products']);
        Route::get('/seller/inventory', [SellerDashboardController::class, 'inventory']);
        Route::put('/seller/inventory/{id}', [SellerDashboardController::class, 'updateStock']);
        Route::get('/seller/orders', [SellerDashboardController::class, 'orders']);
        Route::put('/seller/orders/{id}/status', [SellerDashboardController::class, 'updateOrderItemStatus']);
        Route::post('/seller/orders/{id}/tracking', [SellerDashboardController::class, 'updateOrderItemTracking']);
        Route::get('/seller/orders/{id}/invoice', [SellerDashboardController::class, 'invoice']);
        Route::get('/seller/customers', [SellerDashboardController::class, 'customers']);
        Route::get('/seller/billings', [SellerDashboardController::class, 'billings']);
        Route::get('/seller/coupons', [SellerDashboardController::class, 'coupons']);
        Route::post('/seller/coupons', [SellerDashboardController::class, 'storeCoupon']);
        Route::delete('/seller/coupons/{id}', [SellerDashboardController::class, 'deleteCoupon']);
        Route::get('/seller/reviews', [SellerDashboardController::class, 'reviews']);
        Route::get('/seller/auctions', [SellerDashboardController::class, 'auctions']);
        Route::post('/seller/auctions/{id}/cancel', [SellerDashboardController::class, 'cancelAuction']);
        Route::get('/seller/payouts', [SellerDashboardController::class, 'payouts']);
        Route::post('/seller/payouts', [SellerDashboardController::class, 'requestPayout']);

        // KYC Verification (Artisan & Student Creator)
        Route::get('/kyc', [KycController::class, 'index']);
        Route::post('/kyc', [KycController::class, 'store']);

        // Admin Management Endpoints
        Route::prefix('admin')->group(function () {
            Route::get('/stats', [AdminController::class, 'stats']);
            Route::get('/kyc', [AdminController::class, 'kycList']);
            Route::post('/kyc/{id}/approve', [AdminController::class, 'approveKyc']);
            Route::post('/kyc/{id}/reject', [AdminController::class, 'rejectKyc']);
            Route::get('/settings', [AdminController::class, 'getSettings']);
            Route::post('/settings', [AdminController::class, 'updateSettings']);

            // User CRUD
            Route::get('/users', [AdminController::class, 'indexUsers']);
            Route::post('/users', [AdminController::class, 'storeUser']);
            Route::put('/users/{id}', [AdminController::class, 'updateUser']);
            Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);
            Route::post('/users/{id}/ban', [AdminController::class, 'toggleBanUser']);

            // Stores Moderation & Management
            Route::get('/stores', [AdminController::class, 'indexStores']);
            Route::put('/stores/{id}', [AdminController::class, 'updateStore']);
            Route::delete('/stores/{id}', [AdminController::class, 'deleteStore']);
            Route::post('/stores/{id}/verify', [AdminController::class, 'toggleStoreVerify']);

            // Products Moderation & Full Management
            Route::get('/products', [AdminController::class, 'indexProducts']);
            Route::post('/products', [AdminController::class, 'storeProduct']);
            Route::put('/products/{id}', [AdminController::class, 'updateProduct']);
            Route::post('/products/{id}/feature', [AdminController::class, 'toggleProductFeature']);
            Route::delete('/products/{id}', [AdminController::class, 'deleteProduct']);

            // Auctions Moderation & Full Management
            Route::get('/auctions', [AdminController::class, 'indexAuctions']);
            Route::post('/auctions', [AdminController::class, 'storeAuction']);
            Route::put('/auctions/{id}', [AdminController::class, 'updateAuction']);
            Route::delete('/auctions/{id}', [AdminController::class, 'deleteAuction']);
            Route::post('/auctions/{id}/status', [AdminController::class, 'updateAuctionStatus']);
            Route::get('/auctions/{id}/bids', [AdminController::class, 'auctionBids']);

            // Orders Management
            Route::get('/orders', [AdminController::class, 'indexOrders']);
            Route::get('/orders/{id}', [AdminController::class, 'showOrder']);
            Route::put('/orders/{id}', [AdminController::class, 'updateOrderStatus']);
            Route::post('/orders/{id}/tracking', [AdminController::class, 'updateOrderTracking']);

            // Disputes Management
            Route::get('/disputes', [AdminController::class, 'indexDisputes']);
            Route::post('/disputes/{id}/resolve', [AdminController::class, 'resolveDispute']);
        });
    });
});
