# 🇳🇵 Dharohar (धरोहर) — Full-Stack Marketplace Platform

> **A hybrid B2B + B2C marketplace connecting authentic Nepali master artisans and generational craft traditions with the world, while empowering children, students, and young innovators to showcase, create, and earn.**

---

## 🏛️ System Architecture & Tech Stack

```
dharohar/
├── backend/            # Laravel 13 (latest) RESTful API (PHP 8.4+)
│   ├── Modules/        # Modular Architecture (nwidart/laravel-modules)
│   │   ├── Auth/       # Sanctum token authentication & parental consent
│   │   ├── Product/    # Products, variants, wholesale pricing & categories
│   │   ├── Store/      # Storefronts, managers, and follower systems
│   │   ├── Auction/    # Timed auctions & real-time proxy bidding engine
│   │   ├── Order/      # Multi-vendor orders, tracking, split commissions
│   │   ├── Payment/    # Stripe + eSewa + Khalti + Cash on Delivery
│   │   └── Admin/      # KYC moderation, dispute center, platform analytics
│   ├── app/Models/     # 25+ Eloquent models & relationships
│   └── database/       # 31 database migrations + realistic seeders
│
├── frontend/           # Next.js 15+ (App Router) + TypeScript + Tailwind CSS
│   ├── app/            # App Router pages (Home, Marketplace, Auction Hall, Cart, Checkout, Dashboards)
│   ├── components/     # UI Components (Navbar, Footer, ProductCard, AuctionCard, Badges)
│   ├── context/        # React Context (AuthContext, CartContext)
│   └── lib/            # Axios API client & TypeScript interfaces
│
└── deployment/         # Full Docker & DevOps Infrastructure
    ├── docker-compose.yml       # Production container orchestration
    ├── docker-compose.local.yml # Local development orchestration
    ├── docker/                  # PHP 8.4-FPM, Nginx, PostgreSQL, Redis Dockerfiles
    ├── scripts/                 # deploy.sh, setup.sh, migrate.sh
    └── .github/workflows/       # CI/CD deployment pipeline
```

---

## 🌟 Key Platform Features

1. **Multi-Vendor Marketplace**:
   - Physical goods (woodcarvings, metal statues, hand-spun pashmina)
   - Digital art & sacred mandalas
   - Student prototypes, CAD files, and youth business proposals
   - Search, category trees, and faceted filters

2. **Student & Youth Creator Empowerment**:
   - Subsidized **3% platform commission** for student accounts (vs. standard 10%)
   - Automated parental / guardian consent compliance
   - Dedicated **"Student Creator"** verification badge & discovery filters

3. **Live Auction Hall & Real-Time Bidding**:
   - Timed auctions with live countdown timers
   - **Automatic Proxy Bidding** (system outbids competitors on user's behalf up to their max limit)
   - **Anti-Sniping Auto-Extension** (bids placed within the final 5 minutes extend the clock by 5 minutes)
   - Automatic winner order conversion upon auction conclusion

4. **Multi-Vendor Cart & Checkout**:
   - Multi-vendor cart (items from different artisan stores in a single checkout)
   - Nepal domestic shipping calculation
   - Platform & seller coupons (`DHAROHAR10`, `STUDENTLOVE`)

5. **Triple Payment Gateway Integration**:
   - **eSewa Nepal** (ePay v2 with HMAC-SHA256 signature verification)
   - **Khalti Pay** (v2 E-Payment API & QR code checkout)
   - **Stripe** (International Visa / Mastercard)
   - **Cash on Delivery (COD)**

6. **AWS S3 Cloud Storage with Student Account Support**:
   - Works seamlessly with **NCIT / AWS Academy / AWS Educate** student accounts
   - Includes support for temporary `AWS_SESSION_TOKEN` in `config/filesystems.php`

---

## ⚡ Getting Started Locally

### 1. Backend Setup (Laravel 13)
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve
```
Backend API will be accessible at `http://localhost:8000/api/v1`.

### 2. Frontend Setup (Next.js 15)
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🐳 Docker Deployment Setup (Matching Your Workspace Workflow)

To launch the complete containerized stack (Nginx, PHP-FPM, PostgreSQL, Redis):

```bash
cd deployment

# For local development
docker-compose -f docker-compose.local.yml up -d --build

# Run migrations and seeders inside container
docker-compose -f docker-compose.local.yml exec -T backend php artisan migrate:fresh --seed --force

# For production deployment
docker-compose -f docker-compose.yml up -d --build
```

---

## 🔑 Pre-Seeded Demo Accounts

| Role | Email | Password | Details |
|---|---|---|---|
| **Super Admin** | `admin@dharohar.com` | `password123` | Platform governance, KYC approvals, disputes |
| **Master Artisan** | `artisan.shrestha@dharohar.com` | `password123` | Bhaktapur Woodcraft & Heritage Store |
| **Pashmina Weaver** | `pashmina.gurung@dharohar.com` | `password123` | Himalayan Chyangra Cashmere Store |
| **Student Creator** | `aarav.student@dharohar.com` | `password123` | 17yo Lokta paper artist (Parent consent verified) |
| **Student Innovator** | `sneha.student@dharohar.com` | `password123` | High school eco-irrigation prototype creator |
| **B2B Manufacturer** | `himalayan.crafts@dharohar.com` | `password123` | Wholesale 7-metal singing bowls & tier pricing |
| **Customer / Buyer** | `buyer@dharohar.com` | `password123` | Active bidder & marketplace buyer |

---

## ☁️ AWS S3 Student Account Configuration (NCIT)

In your `backend/.env` file:
```env
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=ASIA...
AWS_SECRET_ACCESS_KEY=...
AWS_SESSION_TOKEN=...           # Required for AWS Academy / Educate Learner Lab
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=dharohar-assets
```

