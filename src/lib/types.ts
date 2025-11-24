export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  unit_amount: number; // in øre/cents
  currency: string;
  inventory_count: number;
  published: boolean;
  created_at: string;
  updated_at: string;
  category?: Category; // joined data
  stripe_price_id?: string;
}

export interface Review {
  id: string;
  product_id: string;
  rating: number; // 1-5
  comment?: string;
  customer_email?: string;
  created_at: string;
}

export interface ProductWithReviews extends Product {
  reviews: Review[];
  averageRating: number;
  reviewCount: number;
}

export interface CatalogFilters {
  search: string;
  category: string;
  sort: 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'newest';
  page: number;
  limit: number;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_amount: number;
  currency: string;
  product?: Product; // joined data
}

export interface Order {
  id: string;
  stripe_session_id: string;
  stripe_payment_intent_id?: string;
  customer_email: string;
  customer_name?: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  currency: string;
  shipping_address?: {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postal_code: string;
    country: string;
  };
  created_at: string;
  updated_at: string;
  items?: OrderItem[]; // joined data
}

export interface CheckoutSessionItem {
  sku: string; // product ID
  name: string;
  unit_price: number; // in øre for NOK
  quantity: number;
  vat_rate: number; // 0.25 for Norway
}

export interface ShippingOption {
  id: string;
  label: string;
  amount: number; // in øre
}

export interface CheckoutSession {
  id: string;
  status: 'created' | 'updated' | 'ready_for_payment' | 'completed';
  items: CheckoutSessionItem[];
  shipping_address?: {
    postal_code: string;
    country: string;
  };
  shipping_options: ShippingOption[];
  selected_shipping?: string;
  currency: 'NOK';
  vat_rate: 0.25;
  subtotal: number;
  shipping_amount: number;
  vat_amount: number;
  grand_total: number;
  messages: string[];
  idempotency_key: string;
  created_at: string;
  updated_at: string;
}
