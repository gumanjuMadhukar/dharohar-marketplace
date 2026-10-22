$routes = @(
    # Admin suite
    'http://127.0.0.1:3005/admin/dashboard',
    'http://127.0.0.1:3005/admin/users',
    'http://127.0.0.1:3005/admin/stores',
    'http://127.0.0.1:3005/admin/products',
    'http://127.0.0.1:3005/admin/auctions',
    'http://127.0.0.1:3005/admin/orders',
    'http://127.0.0.1:3005/admin/kyc',
    'http://127.0.0.1:3005/admin/disputes',
    'http://127.0.0.1:3005/admin/settings',
    'http://127.0.0.1:3005/admin/profile',
    # Seller suite
    'http://127.0.0.1:3005/seller/dashboard',
    'http://127.0.0.1:3005/seller/products',
    'http://127.0.0.1:3005/seller/products/create',
    'http://127.0.0.1:3005/seller/auctions',
    'http://127.0.0.1:3005/seller/orders',
    'http://127.0.0.1:3005/seller/payouts',
    'http://127.0.0.1:3005/seller/settings',
    'http://127.0.0.1:3005/seller/profile',
    # Student suite
    'http://127.0.0.1:3005/student/dashboard',
    'http://127.0.0.1:3005/student/creations',
    'http://127.0.0.1:3005/student/create',
    'http://127.0.0.1:3005/student/guardian',
    'http://127.0.0.1:3005/student/academy',
    'http://127.0.0.1:3005/student/profile',
    # Customer
    'http://127.0.0.1:3005/account',
    'http://127.0.0.1:3005/profile'
)

$passed = 0
$failed = 0

foreach ($r in $routes) {
    try {
        $res = Invoke-WebRequest -Uri $r -UseBasicParsing -TimeoutSec 15
        Write-Host "$r -> $($res.StatusCode)" -ForegroundColor Green
        $passed++
    } catch {
        Write-Host "$r -> FAILED: $_" -ForegroundColor Red
        $failed++
    }
}

Write-Host "Summary: Passed: $passed, Failed: $failed" -ForegroundColor Cyan
