<?php

use Illuminate\Support\Facades\Route;
use Modules\Auction\Http\Controllers\AuctionController;

Route::prefix('v1/auctions')->group(function () {
    Route::get('/', [AuctionController::class, 'index']);
    Route::get('/{id}', [AuctionController::class, 'show']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/{id}/bid', [AuctionController::class, 'bid']);
    });
});
