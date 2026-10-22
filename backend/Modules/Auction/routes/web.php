<?php

use Illuminate\Support\Facades\Route;
use Modules\Auction\Http\Controllers\AuctionController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('auctions', AuctionController::class)->names('auction');
});
