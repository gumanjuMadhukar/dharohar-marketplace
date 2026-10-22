$urls = @(
    'http://127.0.0.1:3005/admin',
    'http://127.0.0.1:3005/seller/dashboard',
    'http://127.0.0.1:3005/student/dashboard',
    'http://127.0.0.1:3005/profile',
    'http://127.0.0.1:3005/account'
)

foreach ($url in $urls) {
    try {
        $res = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 15
        Write-Host "$url -> $($res.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "$url -> FAILED: $_" -ForegroundColor Red
    }
}

