import { Product } from '@/lib/types';
import { NextRequest } from 'next/server';

// OpenAI Product Feed interface based on their specification
export interface OpenAIProduct {
  // OpenAI Flags
  enable_search: boolean;
  enable_checkout: boolean;

  // Basic Product Data
  id: string;
  gtin?: string;
  mpn?: string;
  title: string;
  description: string;
  link: string;

  // Item Information
  condition: 'new' | 'refurbished' | 'used';
  product_category: string;
  brand: string;
  material: string;
  dimensions?: string;
  length?: number;
  width?: number;
  height?: number;
  weight: string;
  age_group?: 'newborn' | 'infant' | 'toddler' | 'kids' | 'adult';

  // Media
  image_link: string;
  additional_image_link?: string[];
  video_link?: string;
  model_3d_link?: string;

  // Price & Promotions
  price: string;
  sale_price?: string;
  sale_price_effective_date?: string;
  unit_pricing_measure?: string;
  base_measure?: string;
  pricing_trend?: string;

  // Availability & Inventory
  availability: 'in_stock' | 'out_of_stock' | 'preorder';
  availability_date?: string;
  inventory_quantity: number;
  expiration_date?: string;
  pickup_method?: 'in_store' | 'reserve' | 'not_supported';
  pickup_sla?: string;

  // Variants (optional - not implementing for now)
  item_group_id?: string;
  item_group_title?: string;
  color?: string;
  size?: string;
  size_system?: string;
  gender?: 'male' | 'female' | 'unisex';

  // Fulfillment
  shipping?: string;

  // Merchant Info
  seller_name: string;
  seller_url: string;
  seller_privacy_policy: string;
  seller_tos: string;

  // Returns
  return_policy: string;
  return_window: number;

  // Performance Signals
  popularity_score?: number;
  return_rate?: number;

  // Compliance
  warning?: string;
  warning_url?: string;
  age_restriction?: number;

  // Reviews and Q&A
  product_review_count?: number;
  product_review_rating?: number;
  store_review_count?: number;
  store_review_rating?: number;
  q_and_a?: string;
  raw_review_data?: string;

  // Related Products
  related_product_id?: string[];
  relationship_type?: ('part_of_set' | 'required_part' | 'often_bought_with' | 'substitute' | 'different_brand' | 'accessory')[];

  // Geo Tagging
  geo_price?: string;
  geo_availability?: string;
}

// Configuration for default values
const FEED_CONFIG = {
  seller: {
    name: 'Agentic Shop',
    url: '', // Will be set from request
    privacy_policy: '', // Will be set from request
    tos: '', // Will be set from request
  },
  defaults: {
    brand: 'Agentic Shop',
    material: 'Premium fabric',
    condition: 'new' as const,
    age_group: 'adult' as const,
    return_window: 30,
    return_policy: '', // Will be set from request
    enable_search: true,
    enable_checkout: true,
  },
  categories: {
    // Map category names to OpenAI product categories
    'T-Shirts': 'Apparel & Accessories > Clothing > Shirts & Tops > T-Shirts',
    'Hoodies': 'Apparel & Accessories > Clothing > Outerwear > Hoodies',
    'Accessories': 'Apparel & Accessories > Clothing Accessories',
    'default': 'Apparel & Accessories > Clothing',
  },
  weights: {
    // Estimated weights by category (in lbs)
    'T-Shirts': '0.5 lb',
    'Hoodies': '1.0 lb',
    'Accessories': '0.2 lb',
    'default': '0.5 lb',
  },
  dimensions: {
    // Estimated dimensions by category (LxWxH)
    'T-Shirts': '12x8x1 in',
    'Hoodies': '15x12x2 in',
    'Accessories': '6x4x1 in',
    'default': '10x8x1 in',
  }
};

export async function transformToOpenAIProductFeed(products: Product[], request: NextRequest): Promise<OpenAIProduct[]> {
  const baseUrl = request.nextUrl.origin;

  // Set dynamic URLs based on request
  const config = {
    ...FEED_CONFIG,
    seller: {
      ...FEED_CONFIG.seller,
      url: baseUrl,
      privacy_policy: `${baseUrl}/privacy`,
      tos: `${baseUrl}/terms`,
    },
    defaults: {
      ...FEED_CONFIG.defaults,
      return_policy: `${baseUrl}/return`,
    }
  };

  return products.map(product => transformProduct(product, config, baseUrl));
}

function transformProduct(product: Product, config: typeof FEED_CONFIG, baseUrl: string): OpenAIProduct {
  // Generate GTIN/MPN if not available (using SKU-like format)
  const gtin = generateGTIN(product.id);
  const mpn = product.id.toUpperCase();

  // Map category to OpenAI taxonomy
  const categoryName = product.category?.name || 'General';
  const productCategory = config.categories[categoryName as keyof typeof config.categories] || config.categories.default;

  // Get weight and dimensions based on category
  const weight = config.weights[categoryName as keyof typeof config.weights] || config.weights.default;
  const dimensions = config.dimensions[categoryName as keyof typeof config.dimensions] || config.dimensions.default;

  // Build product URL
  const productUrl = `${baseUrl}/products/${product.slug}`;

  // Build image URL - use direct database URL for OpenAI feed
  const imageUrl = product.image_url || `${baseUrl}/placeholder-image.jpg`;

  // Format price with currency
  const price = `${(product.unit_amount / 100).toFixed(2)} ${product.currency.toUpperCase()}`;

  // Determine availability
  const availability = product.inventory_count > 0 ? 'in_stock' : 'out_of_stock';

  // Basic shipping info (US-focused for now)
  const shipping = `US:CA:Standard:0.00 USD, US:ALL:Standard:5.99 USD`;

  return {
    // OpenAI Flags
    enable_search: config.defaults.enable_search,
    enable_checkout: config.defaults.enable_checkout,

    // Basic Product Data
    id: product.id,
    gtin,
    mpn,
    title: product.name,
    description: product.description || `${product.name} - High quality product from ${config.seller.name}`,
    link: productUrl,

    // Item Information
    condition: config.defaults.condition,
    product_category: productCategory,
    brand: config.defaults.brand,
    material: config.defaults.material,
    dimensions,
    weight,
    age_group: config.defaults.age_group,

    // Media
    image_link: imageUrl,

    // Price & Promotions
    price,

    // Availability & Inventory
    availability,
    inventory_quantity: product.inventory_count,

    // Fulfillment
    shipping,

    // Merchant Info
    seller_name: config.seller.name,
    seller_url: config.seller.url,
    seller_privacy_policy: config.seller.privacy_policy,
    seller_tos: config.seller.tos,

    // Returns
    return_policy: config.defaults.return_policy,
    return_window: config.defaults.return_window,
  };
}

// Generate a mock GTIN-13 for products that don't have one
function generateGTIN(productId: string): string {
  // Create a 12-digit base from product ID hash, then add check digit
  const hash = simpleHash(productId);
  const baseDigits = hash.toString().padStart(12, '0').slice(-12);
  return baseDigits + calculateCheckDigit(baseDigits);
}

// Simple hash function for consistent GTIN generation
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// Calculate GTIN-13 check digit
function calculateCheckDigit(digits: string): number {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(digits[i]);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const remainder = sum % 10;
  return remainder === 0 ? 0 : 10 - remainder;
}
