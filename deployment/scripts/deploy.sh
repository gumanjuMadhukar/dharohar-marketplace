#!/bin/bash
set -e

echo "🚀 Deploying Dharohar Platform..."

cd "$(dirname "$0")/.."

# Pull latest code or rebuild
docker-compose -f docker-compose.yml up -d --build

# Run database migrations
docker-compose exec -T backend php artisan migrate --force

# Optimize Laravel cache
docker-compose exec -T backend php artisan optimize

echo "✅ Dharohar Deployment Complete!"

