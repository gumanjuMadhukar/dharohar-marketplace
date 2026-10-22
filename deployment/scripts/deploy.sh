#!/bin/bash
set -e

echo "=========================================================="
echo "🚀 Starting Dharohar Marketplace Automated Deployment"
echo "=========================================================="

DEPLOY_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ROOT_DIR="$(cd "$DEPLOY_DIR/.." && pwd)"

# Ensure directories exist for Docker mounts
mkdir -p "$ROOT_DIR/frontend/public"
mkdir -p "$DEPLOY_DIR/nginx/ssl"

# Handle git updates if this is a git checkout
if [ -d "$ROOT_DIR/.git" ]; then
    cd "$ROOT_DIR"
    TARGET_BRANCH="${1:-$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "develop")}"
    echo "📦 Synchronizing git branch: ${TARGET_BRANCH}..."
    git fetch origin "${TARGET_BRANCH}" || true
    git stash || true
    git checkout "${TARGET_BRANCH}" || true
    git pull origin "${TARGET_BRANCH}" || echo "⚠️ Git pull notice: continuing with current workspace files..."
fi

cd "$DEPLOY_DIR"

# Ensure backend .env exists and has required container hostnames
if [ ! -f "$ROOT_DIR/backend/.env" ]; then
    echo "⚙️ Creating backend/.env from .env.example..."
    if [ -f "$ROOT_DIR/backend/.env.example" ]; then
        cp "$ROOT_DIR/backend/.env.example" "$ROOT_DIR/backend/.env"
    fi
fi

# Fix line endings and internal Docker configuration in backend/.env
if [ -f "$ROOT_DIR/backend/.env" ]; then
    # Strip Windows CRLF line endings
    sed -i 's/\r$//' "$ROOT_DIR/backend/.env" 2>/dev/null || true

    # Fix internal Docker service hosts
    sed -i 's/DB_HOST=127.0.0.1/DB_HOST=postgres/g' "$ROOT_DIR/backend/.env" 2>/dev/null || true
    sed -i 's/REDIS_HOST=127.0.0.1/REDIS_HOST=redis/g' "$ROOT_DIR/backend/.env" 2>/dev/null || true
    sed -i 's/DB_PASSWORD=$/DB_PASSWORD=secret/g' "$ROOT_DIR/backend/.env" 2>/dev/null || true

    # Ensure APP_URL has valid format (prevents Symfony Request malformed host exceptions)
    if ! grep -q "^APP_URL=http" "$ROOT_DIR/backend/.env" 2>/dev/null; then
        echo "🔧 Normalizing APP_URL in backend/.env to http://localhost..."
        sed -i 's|^APP_URL=.*|APP_URL=http://localhost|g' "$ROOT_DIR/backend/.env" 2>/dev/null || true
    fi
fi

# Detect Docker Compose command (v2 'docker compose' vs v1 'docker-compose')
if docker compose version >/dev/null 2>&1; then
    COMPOSE="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
    COMPOSE="docker-compose"
else
    echo "❌ Error: Neither 'docker compose' nor 'docker-compose' found on system."
    exit 1
fi

echo "🐳 Building and starting containers with $COMPOSE..."
$COMPOSE -f docker-compose.yml up -d --build

echo "⏳ Waiting for PostgreSQL container to accept connections..."
for i in {1..30}; do
    if $COMPOSE exec -T postgres pg_isready -U "${DB_USERNAME:-postgres}" >/dev/null 2>&1; then
        echo "✅ PostgreSQL is ready!"
        break
    fi
    echo "   PostgreSQL warming up ($i/30)..."
    sleep 1
done

echo "📦 Installing backend Composer dependencies..."
$COMPOSE exec -T backend composer install --no-interaction --prefer-dist --optimize-autoloader --no-dev

# Ensure application key is generated
if ! grep -q "^APP_KEY=base64:" "$ROOT_DIR/backend/.env" 2>/dev/null; then
    echo "🔑 Generating Laravel Application Key..."
    $COMPOSE exec -T backend php artisan key:generate --force
fi

echo "🔄 Running database migrations..."
$COMPOSE exec -T backend php artisan migrate --force

echo "🔗 Ensuring storage symlink..."
$COMPOSE exec -T backend php artisan storage:link || true

echo "🔐 Fixing backend directory permissions..."
$COMPOSE exec -T backend chown -R www-data:www-data storage bootstrap/cache 2>/dev/null || true
$COMPOSE exec -T backend chmod -R 775 storage bootstrap/cache 2>/dev/null || true

echo "⚡ Optimizing Laravel application caches..."
$COMPOSE exec -T backend php artisan optimize:clear
$COMPOSE exec -T backend php artisan optimize

echo "🔄 Restarting queue worker..."
$COMPOSE restart queue-worker

echo "🧹 Pruning unused Docker builder cache and dangling images..."
docker image prune -f || true

echo "=========================================================="
echo "✅ Dharohar Marketplace Deployment Finished Successfully!"
echo "=========================================================="
