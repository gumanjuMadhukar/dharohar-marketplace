<?php

namespace Modules\Order\Http\Controllers;

use App\Http\Controllers\Api\v1\OrderController as BaseOrderController;

class OrderController extends BaseOrderController
{
    // Extends and inherits complete production implementation:
    // - index (lists orders with items, stores, payments)
    // - store (checkout and multi-vendor processing)
    // - show (order detail)
    // - track (public tracking)
}
