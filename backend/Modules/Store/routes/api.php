<?php

use Illuminate\Support\Facades\Route;
use Modules\Store\Http\Controllers\StoreController;

Route::prefix('v1/stores')->group(function () {
    Route::get('/', [StoreController::class, 'index']);
    Route::get('/{slug}', [StoreController::class, 'show']);
});
