<?php

use Illuminate\Support\Facades\Route;
use Modules\Product\Http\Controllers\ProductController;

Route::prefix('v1')->group(function () {
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{slugOrId}', [ProductController::class, 'show']);
    Route::get('/categories', [ProductController::class, 'categories']);
});
