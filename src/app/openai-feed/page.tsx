'use client';

import { useState, useEffect } from 'react';
import { OpenAIProduct } from '@/lib/openai-product-feed';
import { OpenAIProductCard } from '@/components/OpenAIProductCard';
import { FeedStats } from '@/components/FeedStats';

interface FeedData {
  products: OpenAIProduct[];
  _metadata: {
    feed_format: string;
    total_products: number;
    generated_at: string;
    store_name: string;
    store_url: string;
    feed_url: string;
    specification: string;
  };
}

export default function OpenAIFeedPage() {
  const [feedData, setFeedData] = useState<FeedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);

  useEffect(() => {
    fetchFeedData();
  }, []);

  const fetchFeedData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/openai/products');
      if (!response.ok) {
        throw new Error(`Failed to fetch feed: ${response.status}`);
      }
      const data = await response.json();
      setFeedData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading OpenAI Product Feed...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-red-800 font-semibold mb-2">Error Loading Feed</h2>
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchFeedData}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!feedData) return null;

  // Field definitions with ChatGPT requirements
  const FIELD_REQUIREMENTS = {
    // Critical ChatGPT flags
    enable_search: 'required',
    enable_checkout: 'required',

    // Essential product data
    id: 'required',
    title: 'required',
    description: 'required',
    link: 'required',

    // Product classification
    product_category: 'required',
    brand: 'required',

    // Commerce essentials
    price: 'required',
    availability: 'required',
    inventory_quantity: 'required',

    // Product details
    condition: 'required',
    image_link: 'required',

    // Enhanced data
    gtin: 'recommended',
    mpn: 'required',
    material: 'required',
    weight: 'required',

    // Seller information
    seller_name: 'required',
    seller_url: 'required',
    seller_privacy_policy: 'required',
    seller_tos: 'required',
    return_policy: 'required',
    return_window: 'required',

    // Optional enhancements
    shipping: 'optional',
    age_group: 'optional',
    dimensions: 'optional',
    length: 'optional',
    width: 'optional',
    height: 'optional',
    additional_image_link: 'optional',
    video_link: 'optional',
    model_3d_link: 'optional',
    sale_price: 'optional',
    sale_price_effective_date: 'optional',
    unit_pricing_measure: 'optional',
    base_measure: 'optional',
    pricing_trend: 'optional',
    availability_date: 'optional',
    expiration_date: 'optional',
    pickup_method: 'optional',
    pickup_sla: 'optional',
    item_group_id: 'optional',
    item_group_title: 'optional',
    color: 'optional',
    size: 'optional',
    size_system: 'optional',
    gender: 'optional',
    popularity_score: 'optional',
    return_rate: 'optional',
    product_review_count: 'optional',
    product_review_rating: 'optional',
    store_review_count: 'optional',
    store_review_rating: 'optional',
    q_and_a: 'optional',
    raw_review_data: 'optional',
    related_product_id: 'optional',
    relationship_type: 'optional',
    geo_price: 'optional',
    geo_availability: 'optional',
    warning: 'optional',
    warning_url: 'optional',
    age_restriction: 'optional'
  } as const;

  // Format JSON with requirement comments
  const formatJsonWithRequirements = (data: FeedData): string => {
    let jsonString = JSON.stringify(data, null, 2);

    // Add requirement comments to field lines
    Object.keys(FIELD_REQUIREMENTS).forEach(field => {
      const requirement = FIELD_REQUIREMENTS[field as keyof typeof FIELD_REQUIREMENTS];
      // Match field lines and add comment after the value
      const regex = new RegExp(`("${field}":\\s*[^,\\n]+)(,?)$`, 'gm');
      jsonString = jsonString.replace(regex, `$1, // (${requirement})$2`);
    });

    return jsonString;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            OpenAI Product Feed
          </h1>
          <p className="text-gray-600 mb-4">
            ChatGPT-compatible product feed for Agentic Shop
          </p>

          {/* Controls */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setShowRawJson(!showRawJson)}
              className="bg-white border border-gray-300 px-4 py-2 rounded hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              {showRawJson ? 'Hide' : 'Show'} Raw JSON
            </button>
            <button
              onClick={fetchFeedData}
              className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors text-sm font-medium"
            >
              Refresh Feed
            </button>
          </div>
        </div>

        {/* Feed Statistics */}
        <FeedStats metadata={feedData._metadata} productCount={feedData.products.length} />

        {/* ChatGPT Integration Guide */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">ChatGPT Integration Guide</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                Required Fields
              </h3>
              <p className="text-sm text-blue-700 mb-2">
                Must be present for products to appear in ChatGPT search results.
              </p>
              <ul className="text-xs text-blue-600 space-y-1">
                <li>• enable_search & enable_checkout flags</li>
                <li>• Basic product data (title, description, price)</li>
                <li>• Product identifiers and categorization</li>
                <li>• Seller information and policies</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                Recommended Fields
              </h3>
              <p className="text-sm text-blue-700 mb-2">
                Improve search relevance and product matching accuracy.
              </p>
              <ul className="text-xs text-blue-600 space-y-1">
                <li>• GTIN/UPC for better product matching</li>
                <li>• Detailed product specifications</li>
                <li>• Customer reviews and ratings</li>
                <li>• Geographic pricing/availability</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                Optional Fields
              </h3>
              <p className="text-sm text-blue-700 mb-2">
                Enhance user experience but not required for basic functionality.
              </p>
              <ul className="text-xs text-blue-600 space-y-1">
                <li>• 3D models and video content</li>
                <li>• Advanced shipping information</li>
                <li>• Demographic targeting</li>
                <li>• Performance analytics</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-blue-200">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-blue-900">Next Steps</h4>
                <ol className="mt-2 text-sm text-blue-700 space-y-1">
                  <li>1. Ensure all required fields are present (aim for 100% compliance score)</li>
                  <li>2. Submit your feed URL to OpenAI at <a href="https://chatgpt.com/merchants" className="underline hover:text-blue-800" target="_blank" rel="noopener noreferrer">chatgpt.com/merchants</a></li>
                  <li>3. OpenAI will validate and index your products</li>
                  <li>4. Monitor product discovery in ChatGPT shopping experiences</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Raw JSON View */}
        {showRawJson && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Raw Feed Data with Field Requirements</h2>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm">
                {formatJsonWithRequirements(feedData)}
              </pre>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Products ({feedData.products.length})
          </h2>

          {feedData.products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No products found in feed</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {feedData.products.map((product) => (
                <OpenAIProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-8 mt-12">
          <div className="text-center text-gray-500 text-sm">
            <p>
              This feed is automatically generated and compliant with{' '}
              <a
                href={feedData._metadata.specification}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                OpenAI Product Feed Specification
              </a>
            </p>
            <p className="mt-2">
              Submit this feed URL to OpenAI to enable ChatGPT shopping: {' '}
              <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                {feedData._metadata.feed_url}
              </code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
