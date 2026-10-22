#!/bin/bash
set -e

echo "🛠️ Initializing Dharohar Environment..."

cd "$(dirname "$0")/.."

# Ensure .env files exist
if [ ! -f .env.deployment ]; then
    cp .env.production.example .env.deployment
fi

docker-compose -f docker-compose.local.yml up -d --build
docker-compose -f docker-compose.local.yml exec -T backend php artisan key:generate
docker-compose -f docker-compose.local.yml exec -T backend php artisan migrate:fresh --seed --force

echo "🎉 Dharohar local containers up and running!"

