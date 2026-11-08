export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  account_type: 'customer' | 'seller' | 'manufacturer' | 'student' | 'admin' | 'staff' | 'owner' | 'creator';
  avatar?: string;
  bio?: string;
  is_verified?: boolean;
  guardian_name?: string;
  guardian_email?: string;
  guardian_consent?: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  products_count?: number;
}

export interface ProductImage {
  id: number;
  url: string;
  alt_text?: string;
  is_primary: boolean;
}

export interface WholesalePrice {
  id: number;
  min_quantity: number;
  max_quantity?: number;
  price: number;
}

export interface Product {
  id: number;
  store_id: number;
  category_id: number;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  type: 'physical' | 'digital' | 'idea' | 'proposal';
  price: number;
  compare_price?: number;
  sku?: string;
  quantity: number;
  is_handmade: boolean;
  is_featured: boolean;
  is_student_made: boolean;
  is_eco_friendly: boolean;
  avg_rating: number;
  sales_count: number;
  views_count: number;
  primary_image?: ProductImage;
  images?: ProductImage[];
  auctions?: any[];
  wholesale_prices?: WholesalePrice[];
  category?: Category;
  store?: Store;
}

export interface Store {
  id: number;
  user_id: number;
  name: string;
  slug: string;
  description: string;
  logo?: string;
  banner?: string;
  city: string;
  state: string;
  country: string;
  rating: number;
  is_verified: boolean;
  products_count?: number;
  followers_count?: number;
  owner?: User;
}

export interface Bid {
  id: number;
  auction_id: number;
  user_id: number;
  amount: number;
  is_auto: boolean;
  created_at: string;
  user?: {
    id: number;
    name: string;
    avatar?: string;
  };
}

export interface Auction {
  id: number;
  product_id: number;
  store_id: number;
  title: string;
  description: string;
  starting_price: number;
  current_price: number;
  reserve_price?: number;
  bid_increment: number;
  starts_at: string;
  ends_at: string;
  status: 'active' | 'upcoming' | 'ended';
  bids_count?: number;
  product?: Product;
  store?: Store;
  bids?: Bid[];
}

export interface CartItem {
  id: string | number;
  product: Product;
  quantity: number;
}

export interface LiveLot {
  id: number;
  live_room_id: number;
  product_id?: number;
  lot_number: number;
  title: string;
  description?: string;
  image_url?: string;
  starting_price: number;
  reserve_price?: number;
  current_price: number;
  bid_increment: number;
  highest_bidder_id?: number;
  status: 'pending' | 'active' | 'hammered' | 'passed';
  ends_at?: string;
  highest_bidder?: {
    id: number;
    name: string;
    avatar?: string;
  };
}

export interface LiveMessage {
  id: number;
  live_room_id: number;
  user_id?: number;
  user_name: string;
  user_role: string;
  message: string;
  badge?: string;
  is_pinned?: boolean;
  is_system?: boolean;
  created_at?: string;
}

export interface LiveRoom {
  id: number;
  host_id: number;
  store_id?: number;
  title: string;
  slug: string;
  description?: string;
  category: string;
  cover_image?: string;
  stream_url?: string;
  stream_key?: string;
  status: 'scheduled' | 'live' | 'ended' | 'paused';
  current_lot_id?: number;
  viewer_count: number;
  likes_count: number;
  shares_count: number;
  chat_enabled: boolean;
  slow_mode_seconds: number;
  scheduled_at?: string;
  started_at?: string;
  ended_at?: string;
  host?: User;
  store?: Store;
  current_lot?: LiveLot;
  lots?: LiveLot[];
  lots_count?: number;
}

export interface AuditLog {
  id: number;
  user_id?: number;
  role: string;
  action: string;
  entity_type?: string;
  entity_id?: number;
  ip_address?: string;
  user_agent?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  details?: string;
  hmac_hash?: string;
  created_at: string;
  user?: User;
}

