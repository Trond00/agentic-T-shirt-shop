// Simple test script to validate API endpoints
// Run with: node test-api.js

const API_BASE = 'http://localhost:3000/api';

async function testAPI() {
  console.log('🧪 Testing AI Shop API Endpoints\n');

  try {
    // Test 1: Get categories
    console.log('1. Testing categories endpoint...');
    const categoriesResponse = await fetch(`${API_BASE}/categories`);
    const categoriesData = await categoriesResponse.json();

    if (categoriesResponse.ok) {
      console.log('✅ Categories:', categoriesData.categories.length, 'found');
      console.log('   Sample:', categoriesData.categories.slice(0, 2).map(c => c.name));
    } else {
      console.log('❌ Categories failed:', categoriesData.error);
    }

    console.log('');

    // Test 2: Search products
    console.log('2. Testing product search...');
    const searchResponse = await fetch(`${API_BASE}/products/search?q=t-shirt`);
    const searchData = await searchResponse.json();

    if (searchResponse.ok) {
      console.log('✅ Search results:', searchData.total, 'products found');
      if (searchData.products.length > 0) {
        const product = searchData.products[0];
        console.log('   Sample product:', {
          name: product.name,
          price: product.price + ' ' + product.currency,
          in_stock: product.in_stock
        });
      }
    } else {
      console.log('❌ Search failed:', searchData.error);
    }

    console.log('');

    // Test 3: Get product details (if we have products)
    if (searchData.products && searchData.products.length > 0) {
      const productId = searchData.products[0].id;
      console.log('3. Testing product details...');

      const productResponse = await fetch(`${API_BASE}/products/${productId}`);
      const productData = await productResponse.json();

      if (productResponse.ok) {
        const product = productData.product;
        console.log('✅ Product details retrieved');
        console.log('   Name:', product.name);
        console.log('   Price:', product.price + ' ' + product.currency);
        console.log('   Reviews:', product.review_count);
        console.log('   Average rating:', product.average_rating);
        console.log('   In stock:', product.in_stock);
      } else {
        console.log('❌ Product details failed:', productData.error);
      }
    }

    console.log('\n🎉 API testing complete!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Simulate AI assistant workflow
async function simulateAIAssistant() {
  console.log('\n🤖 Simulating AI Assistant Workflow\n');

  try {
    // AI receives user query
    const userQuery = "I want a comfortable t-shirt";
    console.log('User:', userQuery);

    // AI searches products
    console.log('AI: Searching for products...');
    const searchResponse = await fetch(`${API_BASE}/products/search?q=${encodeURIComponent(userQuery)}`);
    const searchData = await searchResponse.json();

    if (searchData.products && searchData.products.length > 0) {
      const product = searchData.products[0];
      console.log('AI: Found product -', product.name);
      console.log('AI: Price -', product.price + ' ' + product.currency);
      console.log('AI: In stock -', product.in_stock ? 'Yes' : 'No');

      // AI could get more details
      console.log('AI: Getting detailed information...');
      const detailResponse = await fetch(`${API_BASE}/products/${product.id}`);
      const detailData = await detailResponse.json();

      if (detailData.product) {
        const fullProduct = detailData.product;
        console.log('AI: Detailed info retrieved');
        console.log('AI: Description -', fullProduct.description?.substring(0, 50) + '...');
        console.log('AI: Reviews -', fullProduct.review_count, 'reviews, avg rating:', fullProduct.average_rating);
      }

      console.log('AI: Ready to help user purchase!');
    } else {
      console.log('AI: No products found for that query');
    }

  } catch (error) {
    console.error('❌ AI simulation failed:', error.message);
  }
}

// Run tests
testAPI().then(() => {
  setTimeout(() => {
    simulateAIAssistant();
  }, 1000);
});
