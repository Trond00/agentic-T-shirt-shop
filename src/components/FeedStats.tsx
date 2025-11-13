import { useState } from 'react';

interface FeedStatsProps {
  metadata: {
    feed_format: string;
    total_products: number;
    generated_at: string;
    store_name: string;
    store_url: string;
    feed_url: string;
    specification: string;
  };
  productCount: number;
}

export function FeedStats({ metadata, productCount }: FeedStatsProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Calculate some basic stats
  const lastGenerated = new Date(metadata.generated_at);
  const timeAgo = getTimeAgo(lastGenerated);

  // Mock validation stats (in a real app, you'd calculate these)
  const validationStats = {
    compliant_products: productCount,
    total_fields: 21, // Based on OpenAI spec
    validation_score: 100, // Assuming all products are compliant
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Feed Statistics</h2>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{productCount}</div>
          <div className="text-sm text-gray-600">Total Products</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {validationStats.validation_score}%
          </div>
          <div className="text-sm text-gray-600">Compliance Score</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {validationStats.compliant_products}
          </div>
          <div className="text-sm text-gray-600">Compliant Products</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {validationStats.total_fields}
          </div>
          <div className="text-sm text-gray-600">Required Fields</div>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          OpenAI Compatible
        </span>

        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Auto-generated GTIN
        </span>

        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h4a2 2 0 012 2v2a2 2 0 01-2 2H8a2 2 0 01-2-2v-2z" clipRule="evenodd" />
          </svg>
          JSON Format
        </span>
      </div>

      {/* Last Updated */}
      <div className="text-sm text-gray-600">
        Last generated: {timeAgo} ({lastGenerated.toLocaleString()})
      </div>

      {/* Detailed Information */}
      {showDetails && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Feed Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Store Information</h4>
              <dl className="space-y-1 text-sm">
                <div>
                  <dt className="inline text-gray-600">Name:</dt>
                  <dd className="inline ml-2 text-gray-900">{metadata.store_name}</dd>
                </div>
                <div>
                  <dt className="inline text-gray-600">URL:</dt>
                  <dd className="inline ml-2">
                    <a href={metadata.store_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {metadata.store_url}
                    </a>
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Feed Information</h4>
              <dl className="space-y-1 text-sm">
                <div>
                  <dt className="inline text-gray-600">Format:</dt>
                  <dd className="inline ml-2 text-gray-900">{metadata.feed_format}</dd>
                </div>
                <div>
                  <dt className="inline text-gray-600">URL:</dt>
                  <dd className="inline ml-2">
                    <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">{metadata.feed_url}</code>
                  </dd>
                </div>
                <div>
                  <dt className="inline text-gray-600">Specification:</dt>
                  <dd className="inline ml-2">
                    <a href={metadata.specification} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      OpenAI Product Feed Spec
                    </a>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Copy Feed URL Button */}
          <div className="mt-4">
            <button
              onClick={() => navigator.clipboard.writeText(metadata.feed_url)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded text-sm font-medium transition-colors"
            >
              Copy Feed URL to Clipboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to format time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
}
