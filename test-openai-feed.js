// Test script for OpenAI Product Feed API
// Run with: node test-openai-feed.js

const API_BASE = 'http://localhost:3000/api';

async function testOpenAIProductFeed() {
  console.log('Testing OpenAI Product Feed API\n');

  try {
    // Test 1: Get OpenAI product feed
    console.log('1. Testing OpenAI product feed endpoint...');
    const feedResponse = await fetch(`${API_BASE}/openai/products`);
    const feedData = await feedResponse.json();

    if (feedResponse.ok) {
      console.log('✅ OpenAI Product Feed retrieved successfully');
      console.log('   Total products:', feedData._metadata.total_products);
      console.log('   Feed format:', feedData._metadata.feed_format);
      console.log('   Generated at:', feedData._metadata.generated_at);

      if (feedData.products && feedData.products.length > 0) {
        console.log('\n📦 Sample product validation:');
        const sampleProduct = feedData.products[0];

        // Validate required OpenAI fields
        const requiredFields = [
          'enable_search', 'enable_checkout', 'id', 'title', 'description',
          'link', 'condition', 'product_category', 'brand', 'material',
          'weight', 'image_link', 'price', 'availability', 'inventory_quantity',
          'seller_name', 'seller_url', 'seller_privacy_policy', 'seller_tos',
          'return_policy', 'return_window'
        ];

        let validFields = 0;
        requiredFields.forEach(field => {
          if (sampleProduct[field] !== undefined && sampleProduct[field] !== null) {
            console.log(`   ✅ ${field}:`, typeof sampleProduct[field] === 'string' && sampleProduct[field].length > 50
              ? sampleProduct[field].substring(0, 50) + '...'
              : sampleProduct[field]);
            validFields++;
          } else {
            console.log(`   ❌ Missing required field: ${field}`);
          }
        });

        console.log(`\n📊 Validation: ${validFields}/${requiredFields.length} required fields present`);

        // Check OpenAI-specific fields
        console.log('\n🔍 OpenAI-specific validation:');
        console.log('   enable_search:', sampleProduct.enable_search);
        console.log('   enable_checkout:', sampleProduct.enable_checkout);
        console.log('   GTIN generated:', !!sampleProduct.gtin);
        console.log('   MPN present:', !!sampleProduct.mpn);
        console.log('   Product category mapped:', sampleProduct.product_category.includes('>'));

        // Validate URLs
        console.log('\n🔗 URL validation:');
        const urlsToCheck = [
          { name: 'Product link', url: sampleProduct.link },
          { name: 'Image link', url: sampleProduct.image_link },
          { name: 'Seller URL', url: sampleProduct.seller_url },
          { name: 'Privacy policy', url: sampleProduct.seller_privacy_policy },
          { name: 'Terms of service', url: sampleProduct.seller_tos },
          { name: 'Return policy', url: sampleProduct.return_policy }
        ];

        for (const { name, url } of urlsToCheck) {
          try {
            const urlResponse = await fetch(url, { method: 'HEAD' });
            console.log(`   ${urlResponse.ok ? '✅' : '⚠️'}  ${name}: ${urlResponse.status}`);
          } catch (error) {
            console.log(`   ❌ ${name}: Failed to check (${error.message})`);
          }
        }

        // Show full product structure
        console.log('\n📋 Complete product structure:');
        console.log(JSON.stringify(sampleProduct, null, 2));
      }
    } else {
      console.log('❌ OpenAI Product Feed failed:', feedData.error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Validate against OpenAI specification
function validateOpenAISpec(product) {
  const issues = [];

  // Required fields validation
  const requiredFields = {
    enable_search: 'boolean',
    enable_checkout: 'boolean',
    id: 'string',
    title: 'string',
    description: 'string',
    link: 'string',
    condition: ['new', 'refurbished', 'used'],
    product_category: 'string',
    brand: 'string',
    material: 'string',
    weight: 'string',
    image_link: 'string',
    price: 'string',
    availability: ['in_stock', 'out_of_stock', 'preorder'],
    inventory_quantity: 'number',
    seller_name: 'string',
    seller_url: 'string',
    seller_privacy_policy: 'string',
    seller_tos: 'string',
    return_policy: 'string',
    return_window: 'number'
  };

  Object.entries(requiredFields).forEach(([field, expectedType]) => {
    const value = product[field];
    if (value === undefined || value === null) {
      issues.push(`Missing required field: ${field}`);
      return;
    }

    if (Array.isArray(expectedType)) {
      if (!expectedType.includes(value)) {
        issues.push(`Invalid value for ${field}: ${value}. Expected one of: ${expectedType.join(', ')}`);
      }
    } else if (typeof value !== expectedType) {
      issues.push(`Invalid type for ${field}: expected ${expectedType}, got ${typeof value}`);
    }
  });

  // URL format validation
  const urlFields = ['link', 'image_link', 'seller_url', 'seller_privacy_policy', 'seller_tos', 'return_policy'];
  urlFields.forEach(field => {
    if (product[field] && !product[field].startsWith('http')) {
      issues.push(`Invalid URL format for ${field}: ${product[field]}`);
    }
  });

  // Price format validation
  if (product.price && !/\d+\.\d{2} [A-Z]{3}/.test(product.price)) {
    issues.push(`Invalid price format: ${product.price}. Expected format: "XX.XX USD"`);
  }

  return issues;
}

// Run tests
testOpenAIProductFeed().then(() => {
  console.log('\n🎉 OpenAI Product Feed testing complete!');
});
