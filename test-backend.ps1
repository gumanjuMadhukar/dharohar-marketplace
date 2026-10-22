$ErrorActionPreference = "Stop"

Write-Host "=== DHAROHAR COMPREHENSIVE BACKEND VALIDATION ===" -ForegroundColor Cyan

# 1. Categories
$catRes = Invoke-RestMethod -Uri "http://127.0.0.1/api/v1/categories" -Method Get
Write-Host "[OK] Categories fetched:" $catRes.data.Count -ForegroundColor Green

# 2. Products
$prodRes = Invoke-RestMethod -Uri "http://127.0.0.1/api/v1/products" -Method Get
Write-Host "[OK] Products in catalog:" $prodRes.data.total -ForegroundColor Green

# 3. Student Registration with Guardian Consent
$randomNum = Get-Random -Minimum 1000 -Maximum 9999
$studentData = @{
    name = "Bipin Shakya"
    email = "bipin.student$randomNum@dharohar.com"
    phone = "9843$randomNum" + "88"
    password = "password123"
    password_confirmation = "password123"
    account_type = "student"
    guardian_name = "Kishor Shakya"
    guardian_email = "kishor.shakya@gmail.com"
    guardian_consent = $true
} | ConvertTo-Json

$reg = Invoke-RestMethod -Uri "http://127.0.0.1/api/v1/auth/register" -Method Post -Body $studentData -ContentType "application/json"
Write-Host "[OK] Student Registered:" $reg.user.name "(Role:" $reg.user.account_type ")" -ForegroundColor Green
$token = $reg.token
$headers = @{ Authorization = "Bearer $token"; Accept = "application/json" }

# 4. Coupon Validation
$couponCheck = @{ code = "DHAROHAR10"; subtotal = 5000 } | ConvertTo-Json
$couponRes = Invoke-RestMethod -Uri "http://127.0.0.1/api/v1/coupons/validate" -Method Post -Body $couponCheck -ContentType "application/json"
Write-Host "[OK] Coupon Validated:" $couponRes.coupon.code "Discount:" $couponRes.coupon.discount -ForegroundColor Green

# 5. Wishlist Toggle
$wishData = @{ product_id = 1 } | ConvertTo-Json
$wishRes = Invoke-RestMethod -Uri "http://127.0.0.1/api/v1/wishlist/toggle" -Method Post -Body $wishData -Headers $headers -ContentType "application/json"
Write-Host "[OK] Wishlist Toggle:" $wishRes.in_wishlist "Message:" $wishRes.message -ForegroundColor Green

# 6. KYC Document Submission
$kycData = @{
    document_type = "citizenship"
    document_number = "27-01-78-01234"
    front_image = "https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=400"
} | ConvertTo-Json
$kycRes = Invoke-RestMethod -Uri "http://127.0.0.1/api/v1/kyc" -Method Post -Body $kycData -Headers $headers -ContentType "application/json"
Write-Host "[OK] KYC Document Submitted. ID:" $kycRes.document.id "Status:" $kycRes.document.status -ForegroundColor Green

# 7. Admin Login & Stats Check
$adminLoginData = @{ email = "admin@dharohar.com"; password = "password123" } | ConvertTo-Json
$adminLogin = Invoke-RestMethod -Uri "http://127.0.0.1/api/v1/auth/login" -Method Post -Body $adminLoginData -ContentType "application/json"
$adminHeaders = @{ Authorization = "Bearer " + $adminLogin.token; Accept = "application/json" }

$stats = Invoke-RestMethod -Uri "http://127.0.0.1/api/v1/admin/stats" -Method Get -Headers $adminHeaders
Write-Host "[OK] Admin Stats verified. Total GMV: NPR" $stats.stats.total_gmv "Total Users:" $stats.stats.total_users "Stores:" $stats.stats.total_stores -ForegroundColor Green

# 8. Admin KYC Approval
$approveRes = Invoke-RestMethod -Uri "http://127.0.0.1/api/v1/admin/kyc/$($kycRes.document.id)/approve" -Method Post -Headers $adminHeaders
Write-Host "[OK] Admin approved KYC. Document Status:" $approveRes.kyc.status -ForegroundColor Green

# 9. Multi-Vendor Order Placement with eSewa
$orderData = @{
    items = @(
        @{ product_id = 1; quantity = 1 }
        @{ product_id = 3; quantity = 2 }
    )
    shipping_name = "Bipin Shakya"
    shipping_email = $reg.user.email
    shipping_phone = "9843112233"
    shipping_address = "Patan Durbar Square"
    shipping_city = "Lalitpur"
    shipping_state = "Bagmati"
    shipping_country = "Nepal"
    payment_method = "esewa"
} | ConvertTo-Json

$orderRes = Invoke-RestMethod -Uri "http://127.0.0.1/api/v1/checkout" -Method Post -Body $orderData -Headers $headers -ContentType "application/json"
Write-Host "[OK] Multi-Vendor Order Created:" $orderRes.order.order_number "Items:" $orderRes.order.items.Count "Total: NPR" $orderRes.order.total -ForegroundColor Green

# 10. Live Auction Bidding
$auctionRes = Invoke-RestMethod -Uri "http://127.0.0.1/api/v1/auctions/1" -Method Get
$minBid = [double]$auctionRes.min_next_bid
$bidData = @{ amount = $minBid } | ConvertTo-Json
$bidRes = Invoke-RestMethod -Uri "http://127.0.0.1/api/v1/auctions/1/bid" -Method Post -Body $bidData -Headers $headers -ContentType "application/json"
Write-Host "[OK] Live Auction Bid Successful! Artifact:" $auctionRes.auction.title "New Price: NPR" $bidRes.current_price -ForegroundColor Green

Write-Host "=== ALL 10 COMPREHENSIVE BACKEND TESTS PASSED WITH 100% SUCCESS ===" -ForegroundColor Cyan

