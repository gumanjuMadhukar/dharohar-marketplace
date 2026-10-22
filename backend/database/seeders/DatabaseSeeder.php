<?php

namespace Database\Seeders;

use App\Models\Auction;
use App\Models\Banner;
use App\Models\Bid;
use App\Models\BlogPost;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\PlatformSetting;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use App\Models\Review;
use App\Models\Store;
use App\Models\User;
use App\Models\WholesalePrice;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── 1. Roles & Permissions ──────────────────────────────
        $roles = ['admin', 'seller', 'manufacturer', 'student', 'customer', 'store_manager'];
        foreach ($roles as $roleName) {
            Role::firstOrCreate(['name' => $roleName, 'guard_name' => 'web']);
        }

        // ── 2. Users ───────────────────────────────────────────
        $admin = User::firstOrCreate(
            ['email' => 'admin@dharohar.com'],
            [
                'name' => 'Platform Administrator',
                'password' => Hash::make('password123'),
                'account_type' => 'admin',
                'is_active' => true,
                'is_verified' => true,
                'locale' => 'en',
            ]
        );
        $admin->assignRole('admin');

        // Artisans / Sellers
        $seller1 = User::firstOrCreate(
            ['email' => 'artisan.shrestha@dharohar.com'],
            [
                'name' => 'Bikash Shrestha',
                'phone' => '9841234567',
                'password' => Hash::make('password123'),
                'account_type' => 'seller',
                'bio' => 'Master Woodcarver and Bronze Artisan from Bhaktapur with 25 years of heritage craftsmanship.',
                'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
                'is_active' => true,
                'is_verified' => true,
            ]
        );
        $seller1->assignRole('seller');

        $seller2 = User::firstOrCreate(
            ['email' => 'pashmina.gurung@dharohar.com'],
            [
                'name' => 'Doma Gurung',
                'phone' => '9851234567',
                'password' => Hash::make('password123'),
                'account_type' => 'seller',
                'bio' => 'Hand-spun authentic Himalayan Chyangra Cashmere and Pashmina weaver.',
                'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
                'is_active' => true,
                'is_verified' => true,
            ]
        );
        $seller2->assignRole('seller');

        // Student Creators (Child & Young Innovators)
        $student1 = User::firstOrCreate(
            ['email' => 'aarav.student@dharohar.com'],
            [
                'name' => 'Aarav Bajracharya',
                'phone' => '9861234567',
                'password' => Hash::make('password123'),
                'account_type' => 'student',
                'date_of_birth' => '2009-06-15',
                'bio' => '17-year-old student artist from Patan creating contemporary Lokta paper art and digital mandala illustrations.',
                'guardian_name' => 'Sunil Bajracharya',
                'guardian_email' => 'sunil.bajra@gmail.com',
                'guardian_consent' => true,
                'avatar' => 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200',
                'is_active' => true,
                'is_verified' => true,
            ]
        );
        $student1->assignRole('student');

        $student2 = User::firstOrCreate(
            ['email' => 'sneha.student@dharohar.com'],
            [
                'name' => 'Sneha Tamang',
                'phone' => '9811234567',
                'password' => Hash::make('password123'),
                'account_type' => 'student',
                'date_of_birth' => '2008-03-22',
                'bio' => 'High school robotics and eco-design student creating upcycled tea-seed bio-plastics and handmade hemp accessories.',
                'guardian_name' => 'Maya Tamang',
                'guardian_email' => 'maya.tamang@gmail.com',
                'guardian_consent' => true,
                'avatar' => 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200',
                'is_active' => true,
                'is_verified' => true,
            ]
        );
        $student2->assignRole('student');

        // Manufacturer / Wholesale Seller
        $manufacturer = User::firstOrCreate(
            ['email' => 'himalayan.crafts@dharohar.com'],
            [
                'name' => 'Himalayan Organic Producers Ltd',
                'phone' => '9801234567',
                'password' => Hash::make('password123'),
                'account_type' => 'manufacturer',
                'bio' => 'Cooperative of 300+ women artisans producing bulk felt crafts, singing bowls, and organic tea.',
                'avatar' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200',
                'is_active' => true,
                'is_verified' => true,
            ]
        );
        $manufacturer->assignRole('manufacturer');

        // Customer
        $customer = User::firstOrCreate(
            ['email' => 'buyer@dharohar.com'],
            [
                'name' => 'Pradeep Thapa',
                'phone' => '9849998877',
                'password' => Hash::make('password123'),
                'account_type' => 'customer',
                'bio' => 'Art collector and promoter of indigenous Nepali craftsmanship.',
                'avatar' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
                'is_active' => true,
                'is_verified' => true,
            ]
        );
        $customer->assignRole('customer');

        // ── 3. Categories ───────────────────────────────────────
        $categoriesData = [
            [
                'name' => 'Handicrafts & Sculpture',
                'slug' => 'handicrafts-sculpture',
                'description' => 'Authentic hand-carved wood, stone, bronze deities, and traditional pottery.',
                'image' => 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600',
                'icon' => 'Hammer',
            ],
            [
                'name' => 'Art, Mandalas & Thangka',
                'slug' => 'art-mandalas-thangka',
                'description' => 'Original Buddhist Thangka scrolls, mineral pigment paintings, and student canvas designs.',
                'image' => 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600',
                'icon' => 'Palette',
            ],
            [
                'name' => 'Pashmina & Himalayan Textiles',
                'slug' => 'pashmina-himalayan-textiles',
                'description' => 'Chyangra cashmere shawls, authentic Dhaka topis, raw hemp bags, and hand-knitted yak wool.',
                'image' => 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600',
                'icon' => 'Shirt',
            ],
            [
                'name' => 'Student Innovations & Ideas',
                'slug' => 'student-innovations-ideas',
                'description' => 'Creative inventions, school project prototypes, architectural models, and youth business proposals.',
                'image' => 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600',
                'icon' => 'Sparkles',
            ],
            [
                'name' => 'Organic Herbs, Tea & Spices',
                'slug' => 'herbs-tea-spices',
                'description' => 'High-altitude orthodox Ilam tea, Timut pepper, Himalayan raw honey, and natural incense.',
                'image' => 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600',
                'icon' => 'Leaf',
            ],
        ];

        $categories = [];
        foreach ($categoriesData as $idx => $cat) {
            $categories[$cat['slug']] = Category::firstOrCreate(
                ['slug' => $cat['slug']],
                array_merge($cat, ['sort_order' => $idx + 1, 'is_active' => true])
            );
        }

        // ── 4. Stores ───────────────────────────────────────────
        $store1 = Store::firstOrCreate(
            ['slug' => 'bhaktapur-woodcraft-heritage'],
            [
                'user_id' => $seller1->id,
                'name' => 'Bhaktapur Woodcraft & Heritage',
                'description' => 'Preserving 500-year-old Newari traditional carving traditions from Taumadhi Square, Bhaktapur.',
                'logo' => 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=200',
                'banner' => 'https://images.unsplash.com/photo-1609137144822-4467554904a4?w=1200',
                'address' => 'Taumadhi Square, Ward 4',
                'city' => 'Bhaktapur',
                'state' => 'Bagmati',
                'country' => 'Nepal',
                'phone' => '9841234567',
                'email' => 'bhaktapur.crafts@dharohar.com',
                'is_verified' => true,
                'is_active' => true,
                'rating' => 4.95,
                'total_sales' => 142,
            ]
        );

        $store2 = Store::firstOrCreate(
            ['slug' => 'himalayan-chyangra-cashmere'],
            [
                'user_id' => $seller2->id,
                'name' => 'Himalayan Chyangra Cashmere',
                'description' => 'Pure hand-loomed grade-A cashmere collected sustainably from Mustang and Manang pastures.',
                'logo' => 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=200',
                'banner' => 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1200',
                'address' => 'Thamel Marg',
                'city' => 'Kathmandu',
                'state' => 'Bagmati',
                'country' => 'Nepal',
                'phone' => '9851234567',
                'email' => 'cashmere@dharohar.com',
                'is_verified' => true,
                'is_active' => true,
                'rating' => 4.88,
                'total_sales' => 98,
            ]
        );

        $studentStore1 = Store::firstOrCreate(
            ['slug' => 'aarav-youth-art-studio'],
            [
                'user_id' => $student1->id,
                'name' => 'Aarav Youth Art Studio',
                'description' => 'Student creator studio crafting botanical Lokta paper sketchbooks and hand-inked spiritual geometry.',
                'logo' => 'https://images.unsplash.com/photo-1460661419200-fd4358377982?w=200',
                'banner' => 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1200',
                'address' => 'Mangalbazar, Patan',
                'city' => 'Lalitpur',
                'state' => 'Bagmati',
                'country' => 'Nepal',
                'phone' => '9861234567',
                'email' => 'aarav.studio@dharohar.com',
                'is_verified' => true,
                'is_active' => true,
                'rating' => 4.90,
                'total_sales' => 45,
            ]
        );

        $studentStore2 = Store::firstOrCreate(
            ['slug' => 'sneha-eco-innovations'],
            [
                'user_id' => $student2->id,
                'name' => 'Sneha Eco Innovations',
                'description' => 'Student-led green startup converting discarded agricultural waste into functional sustainable art.',
                'logo' => 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=200',
                'banner' => 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=1200',
                'address' => 'Balkumari, Lalitpur',
                'city' => 'Lalitpur',
                'state' => 'Bagmati',
                'country' => 'Nepal',
                'phone' => '9811234567',
                'email' => 'sneha.eco@dharohar.com',
                'is_verified' => true,
                'is_active' => true,
                'rating' => 5.00,
                'total_sales' => 28,
            ]
        );

        $mfgStore = Store::firstOrCreate(
            ['slug' => 'himalayan-artisan-collective'],
            [
                'user_id' => $manufacturer->id,
                'name' => 'Himalayan Artisan Wholesale Collective',
                'description' => 'B2B certified manufacturer supplying fair-trade singing bowls, felt rugs, and wholesale herbal extracts.',
                'logo' => 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=200',
                'banner' => 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1200',
                'address' => 'Industrial Estate, Patan',
                'city' => 'Lalitpur',
                'state' => 'Bagmati',
                'country' => 'Nepal',
                'phone' => '9801234567',
                'email' => 'wholesale@dharohar.com',
                'is_verified' => true,
                'is_active' => true,
                'rating' => 4.80,
                'total_sales' => 512,
            ]
        );

        // ── 5. Products ─────────────────────────────────────────
        $productsData = [
            [
                'store_id' => $store1->id,
                'category_id' => $categories['handicrafts-sculpture']->id,
                'name' => 'Hand-Carved Newari Peacock Window (Mayur Jhyal)',
                'slug' => 'hand-carved-newari-peacock-window',
                'description' => 'Carved from single-block seasoned Sal wood by master craftsmen in Bhaktapur. Featuring the iconic sacred peacock with ornate floral lattice framework. Perfect as centerpiece wall installation.',
                'short_description' => 'Traditional Newari architectural woodcraft carving from Bhaktapur.',
                'type' => 'physical',
                'price' => 12500.00,
                'compare_price' => 15000.00,
                'sku' => 'BHK-JHYAL-01',
                'quantity' => 15,
                'is_handmade' => true,
                'is_featured' => true,
                'is_student_made' => false,
                'is_eco_friendly' => true,
                'avg_rating' => 4.95,
                'image' => 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800',
            ],
            [
                'store_id' => $store2->id,
                'category_id' => $categories['pashmina-himalayan-textiles']->id,
                'name' => 'Authentic Mustang Chyangra Cashmere Shawl (Diamond Weave)',
                'slug' => 'authentic-mustang-chyangra-cashmere-shawl',
                'description' => 'Ultra-fine 100% Chyangra mountain goat underfleece hand-woven on wooden pit looms. Feather-light yet exceptionally warm, finished with hand-twisted fringes.',
                'short_description' => '100% pure organic Chyangra cashmere hand-loomed in Kathmandu.',
                'type' => 'physical',
                'price' => 18500.00,
                'compare_price' => 22000.00,
                'sku' => 'CHY-SHAWL-02',
                'quantity' => 25,
                'is_handmade' => true,
                'is_featured' => true,
                'is_student_made' => false,
                'is_eco_friendly' => true,
                'avg_rating' => 4.90,
                'image' => 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800',
            ],
            [
                'store_id' => $studentStore1->id,
                'category_id' => $categories['art-mandalas-thangka']->id,
                'name' => 'Handmade Daphne Lokta Paper Botanical Journal',
                'slug' => 'handmade-daphne-lokta-paper-botanical-journal',
                'description' => 'Created by 17-year-old student creator Aarav. Tree-free Lokta paper made using traditional Himalayan sun-drying techniques, bound with natural hemp cord and pressed wildflowers.',
                'short_description' => 'Student-crafted eco-friendly journal on authentic Lokta parchment.',
                'type' => 'physical',
                'price' => 1200.00,
                'compare_price' => 1600.00,
                'sku' => 'STU-LOKTA-03',
                'quantity' => 50,
                'is_handmade' => true,
                'is_featured' => true,
                'is_student_made' => true,
                'is_eco_friendly' => true,
                'avg_rating' => 5.00,
                'image' => 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800',
            ],
            [
                'store_id' => $studentStore2->id,
                'category_id' => $categories['student-innovations-ideas']->id,
                'name' => 'Solar-Powered Automated Drip Irrigation Prototype Design',
                'slug' => 'solar-powered-automated-drip-irrigation-prototype',
                'description' => 'Youth invention by student Sneha Tamang: complete open-hardware schematic, 3D printable casing files, and sensor source code designed for terraced hillside farming in rural Nepal.',
                'short_description' => 'Complete blueprint, CAD files, and firmware proposal for terrace farming.',
                'type' => 'idea',
                'price' => 2500.00,
                'sku' => 'STU-INNOV-04',
                'quantity' => 999,
                'is_handmade' => false,
                'is_featured' => true,
                'is_student_made' => true,
                'is_eco_friendly' => true,
                'avg_rating' => 5.00,
                'image' => 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800',
            ],
            [
                'store_id' => $mfgStore->id,
                'category_id' => $categories['handicrafts-sculpture']->id,
                'name' => '7-Metal Hand-Hammered Tibetan Singing Bowl (Master Grade)',
                'slug' => '7-metal-hand-hammered-tibetan-singing-bowl',
                'description' => 'Forged by generational metal-smiths from copper, tin, silver, iron, gold, zinc, and nickel. Produces rich, resonant harmonic frequencies for meditation and sound healing.',
                'short_description' => 'Authentic hand-beaten 7-metal meditation bowl with cushion & mallet.',
                'type' => 'physical',
                'price' => 8500.00,
                'compare_price' => 11000.00,
                'sku' => 'WH-BOWL-05',
                'quantity' => 80,
                'is_handmade' => true,
                'is_featured' => true,
                'is_student_made' => false,
                'is_eco_friendly' => true,
                'avg_rating' => 4.85,
                'image' => 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=800',
            ],
            [
                'store_id' => $store1->id,
                'category_id' => $categories['art-mandalas-thangka']->id,
                'name' => 'Hand-Painted Wheel of Life (Bhavachakra) Thangka',
                'slug' => 'hand-painted-wheel-of-life-thangka',
                'description' => 'Painted over 4 months by master Buddhist Lama artists using real 24k gold leaf and natural stone mineral pigments on primed cotton canvas.',
                'short_description' => 'Authentic 24k gold accented Buddhist Thangka scroll painting.',
                'type' => 'physical',
                'price' => 35000.00,
                'compare_price' => 42000.00,
                'sku' => 'THK-BHAVA-06',
                'quantity' => 3,
                'is_handmade' => true,
                'is_featured' => true,
                'is_student_made' => false,
                'is_eco_friendly' => true,
                'avg_rating' => 5.00,
                'image' => 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800',
            ],
        ];

        $createdProducts = [];
        foreach ($productsData as $pData) {
            $imgUrl = $pData['image'];
            unset($pData['image']);
            $pData['is_active'] = true;
            $pData['views_count'] = rand(80, 520);
            $pData['sales_count'] = rand(10, 48);

            $product = Product::firstOrCreate(['slug' => $pData['slug']], $pData);

            ProductImage::firstOrCreate(
                ['product_id' => $product->id, 'url' => $imgUrl],
                ['alt_text' => $product->name, 'sort_order' => 0, 'is_primary' => true]
            );

            // Add wholesale tiers for bulk items
            if ($product->store_id === $mfgStore->id) {
                WholesalePrice::firstOrCreate(
                    ['product_id' => $product->id, 'min_quantity' => 10],
                    ['max_quantity' => 49, 'price' => $product->price * 0.85]
                );
                WholesalePrice::firstOrCreate(
                    ['product_id' => $product->id, 'min_quantity' => 50],
                    ['max_quantity' => null, 'price' => $product->price * 0.70]
                );
            }

            $createdProducts[] = $product;
        }

        // ── 6. Live Auctions ────────────────────────────────────
        $auctionProduct1 = $createdProducts[0]; // Peacock Window
        $auction1 = Auction::firstOrCreate(
            ['title' => 'Rare Antique Teak Mayur Jhyal (Peacock Window) Live Auction'],
            [
                'product_id' => $auctionProduct1->id,
                'store_id' => $auctionProduct1->store_id,
                'description' => 'Exclusive master-carved collector edition with 24-spoke floral medallion. Live bidding open with automated proxy increments.',
                'starting_price' => 10000.00,
                'current_price' => 16500.00,
                'reserve_price' => 15000.00,
                'bid_increment' => 500.00,
                'starts_at' => now()->subHours(12),
                'ends_at' => now()->addDays(14),
                'status' => 'active',
                'auto_extend' => true,
                'extend_minutes' => 5,
            ]
        );

        $auctionProduct2 = $createdProducts[5]; // Thangka
        $auction2 = Auction::firstOrCreate(
            ['title' => 'Master 24k Gold Kalachakra Mandala Scroll Auction'],
            [
                'product_id' => $auctionProduct2->id,
                'store_id' => $auctionProduct2->store_id,
                'description' => 'Consecrated sacred mandala by Master Tenzing with certified authenticity documentation.',
                'starting_price' => 30000.00,
                'current_price' => 38000.00,
                'reserve_price' => 35000.00,
                'bid_increment' => 1000.00,
                'starts_at' => now()->subDay(),
                'ends_at' => now()->addDays(10),
                'status' => 'active',
                'auto_extend' => true,
                'extend_minutes' => 5,
            ]
        );

        // Seed some bids
        Bid::firstOrCreate(
            ['auction_id' => $auction1->id, 'amount' => 12000.00],
            ['user_id' => $customer->id, 'is_auto' => false]
        );
        Bid::firstOrCreate(
            ['auction_id' => $auction1->id, 'amount' => 14500.00],
            ['user_id' => $seller2->id, 'is_auto' => false]
        );
        Bid::firstOrCreate(
            ['auction_id' => $auction1->id, 'amount' => 16500.00],
            ['user_id' => $customer->id, 'is_auto' => true, 'max_amount' => 20000.00]
        );

        // ── 7. Coupons ──────────────────────────────────────────
        Coupon::firstOrCreate(
            ['code' => 'DHAROHAR10'],
            [
                'type' => 'percentage',
                'value' => 10.00,
                'min_order_amount' => 1000.00,
                'max_discount' => 1500.00,
                'usage_limit' => 500,
                'used_count' => 34,
                'starts_at' => now()->subMonth(),
                'expires_at' => now()->addMonths(6),
                'is_active' => true,
            ]
        );
        Coupon::firstOrCreate(
            ['code' => 'STUDENTLOVE'],
            [
                'type' => 'fixed',
                'value' => 200.00,
                'min_order_amount' => 800.00,
                'usage_limit' => 200,
                'used_count' => 18,
                'starts_at' => now()->subMonth(),
                'expires_at' => now()->addMonths(3),
                'is_active' => true,
            ]
        );

        // ── 8. Banners ──────────────────────────────────────────
        Banner::firstOrCreate(
            ['title' => 'Celebrate Nepal’s Heritage & Support Young Creators'],
            [
                'image' => 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1600',
                'link' => '/marketplace',
                'position' => 'hero',
                'sort_order' => 1,
                'is_active' => true,
            ]
        );

        // ── 9. Educational Blog / Resources ─────────────────────
        BlogPost::firstOrCreate(
            ['slug' => 'how-students-can-sell-on-dharohar'],
            [
                'user_id' => $admin->id,
                'title' => 'Empowering Young Minds: How Students Can Showcase & Earn on Dharohar',
                'excerpt' => 'A guide for student creators, parents, and schools on monetizing art, designs, science models, and eco-innovations safely with parental consent.',
                'content' => 'Dharohar provides a safe, curated space for students under 18 with parental consent. Young creators learn entrepreneurship, digital commerce, and financial literacy while celebrating cultural heritage.',
                'featured_image' => 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
                'category' => 'Youth Entrepreneurship',
                'is_published' => true,
                'published_at' => now()->subDays(5),
                'views_count' => 320,
            ]
        );

        // ── 10. Platform Settings ───────────────────────────────
        PlatformSetting::set('platform_commission', '10');
        PlatformSetting::set('student_commission', '3'); // Reduced 3% commission for student creators!
        PlatformSetting::set('site_currency', 'NPR');
        PlatformSetting::set('esewa_enabled', 'true');
        PlatformSetting::set('khalti_enabled', 'true');
        PlatformSetting::set('stripe_enabled', 'true');
    }
}
