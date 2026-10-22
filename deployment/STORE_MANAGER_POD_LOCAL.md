# Dharohar Store Manager & Pod Architecture

## Overview
Dharohar features a multi-tenant store manager system allowing:
1. **Store Owners** (Artisans, Manufacturers, Student Creators) to invite managers
2. **Role-Based Permissions**:
   - `manage_products` (inventory, variants, pricing)
   - `manage_orders` (fulfillment, status updates, tracking numbers)
   - `manage_auctions` (create live auctions, set reserve prices)
   - `view_analytics` (sales performance, customer reviews)
   - `manage_coupons` (store-level discount codes)

## Local Container Pods
- **Nginx Ingress**: Port 80 / 443
- **PHP-FPM Backend**: Port 9000
- **Postgres Database**: Port 5432
- **Redis Cache & Queue**: Port 6379
- **Next.js Frontend**: Port 3000

## Quick Commands
```bash
# Start local environment
cd deployment
docker-compose -f docker-compose.local.yml up -d

# Seed store manager demo accounts
docker-compose -f docker-compose.local.yml exec -T backend php artisan db:seed
```

