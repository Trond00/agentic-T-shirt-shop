// Test script for OpenAI Checkout Sessions API
// Simulates ChatGPT's complete purchase flow
// Run with: node test-checkout-sessions.js

const API_BASE = 'http://localhost:3000/api';

class ChatGPTSimulator {
  constructor() {
    this.sessionId = null;
    this.productId = null;
  }

  async step(name, fn) {
    console.log(`\n🔄 ${name}`);
    try {
      await fn();
      console.log(`✅ ${name} - SUCCESS`);
    } catch (error) {
      console.error(`❌ ${name} - FAILED:`, error.message);
      throw error;
    }
  }

  async apiCall(url, options = {}) {
    const response = await fetch(`${API_BASE}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${data.error || 'Unknown error'}`);
    }

    return data;
  }

  async simulateProductDiscovery() {
    console.log('   ChatGPT: "I need to find products to show to the user..."');

    const feedData = await this.apiCall('/openai/products');
    console.log(`   Found ${feedData._metadata.total_products} products in the feed`);

    // Pick the first available product
    const availableProduct = feedData.products.find(p => p.availability === 'in_stock');
    if (!availableProduct) {
      throw new Error('No products available in feed');
    }

    this.productId = availableProduct.id;
    console.log(`   Selected product: ${availableProduct.title} (${this.productId}) - ${availableProduct.price}`);
  }

  async simulateCartCreation() {
    console.log('   User: "I want to buy this T-shirt!"');
    console.log('   ChatGPT: "Creating cart session..."');

    const sessionData = await this.apiCall('/openai/checkout_sessions', {
      method: 'POST',
      body: JSON.stringify({
        items: [{ sku: this.productId, quantity: 1 }],
        shipping_address: { postal_code: '0550', country: 'NO' },
        currency: 'NOK',
        idempotency_key: 'test-session-123',
      }),
    });

    this.sessionId = sessionData.id;
    console.log(`   Created session: ${this.sessionId}`);
    console.log(`   Cart total: ${(sessionData.grand_total / 100).toFixed(2)} NOK (inkl. ${sessionData.vat_amount / 100} NOK VAT)`);
    console.log(`   Shipping options: ${sessionData.shipping_options.map(opt => `${opt.label}: ${(opt.amount / 100).toFixed(2)} NOK`).join(', ')}`);
  }

  async simulateQuantityUpdate() {
    console.log('   User: "Actually, I want 2 of them!"');
    console.log('   ChatGPT: "Updating cart quantities..."');

    const updateData = await this.apiCall(`/openai/checkout_sessions/${this.sessionId}`, {
      method: 'POST',
      body: JSON.stringify({
        items: [{ sku: this.productId, quantity: 2 }],
      }),
    });

    console.log(`   Updated cart: 2 × ${updateData.items[0].name}`);
    console.log(`   New total: ${(updateData.grand_total / 100).toFixed(2)} NOK`);
  }

  async simulateShippingUpdate() {
    console.log('   User: "I need express shipping!"');
    console.log('   ChatGPT: "Updating shipping method..."');

    const updateData = await this.apiCall(`/openai/checkout_sessions/${this.sessionId}`, {
      method: 'POST',
      body: JSON.stringify({
        shipping_option: 'express',
      }),
    });

    const expressShipping = updateData.shipping_options.find(opt => opt.id === 'express');
    console.log(`   Changed to: ${expressShipping.label} (+${(expressShipping.amount / 100).toFixed(2)} NOK)`);
    console.log(`   Final total: ${(updateData.grand_total / 100).toFixed(2)} NOK`);
  }

  async simulateOrderCompletion() {
    console.log('   User: "Yes, Ill buy it now!"');
    console.log('   ChatGPT: "Processing payment..."');

    const orderData = await this.apiCall(`/openai/checkout_sessions/${this.sessionId}/complete`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'test.customer@chatgpt.com',
        name: 'Test User',
        // In real ChatGPT, this would include payment_token from delegated payment
        // For POC, we use the Stripe checkout flow
      }),
    });

    console.log(`   Order completed! Order ID: ${orderData.order_id}`);
    console.log(`   Payment URL: ${orderData.payment_url || 'Direct payment processed'}`);
    console.log(`   Final total: ${(orderData.total.grand_total / 100).toFixed(2)} NOK (VAT: ${(orderData.total.vat / 100).toFixed(2)} NOK)`);

    return orderData;
  }

  async verifyOrderCreation(orderId) {
    console.log('   ChatGPT: "Confirming order was created..."');

    // Get orders by the test email
    const orders = await this.apiCall('/orders?email=test.customer@chatgpt.com');

    const matchingOrder = orders.find(order => order.id === orderId);
    if (!matchingOrder) {
      throw new Error(`Order ${orderId} not found in database`);
    }

    console.log(`   Order verified in database:`);
    console.log(`   - Status: ${matchingOrder.status}`);
    console.log(`   - Items: ${matchingOrder.items?.length || 0}`);
    console.log(`   - Total: ${(matchingOrder.total_amount / 100).toFixed(2)} NOK`);

    return matchingOrder;
  }

  async runFullTest() {
    console.log('🎯 Starting complete ChatGPT shopping simulation\n');

    try {
      // 1. ChatGPT discovers products
      await this.step('Product Discovery', () => this.simulateProductDiscovery());

      // 2. User wants to buy, ChatGPT creates cart
      await this.step('Cart Creation', () => this.simulateCartCreation());

      // 3. User changes quantity
      await this.step('Quantity Update', () => this.simulateQuantityUpdate());

      // 4. User selects shipping
      await this.step('Shipping Update', () => this.simulateShippingUpdate());

      // 5. User completes purchase
      const orderResult = await this.step('Order Completion', () => this.simulateOrderCompletion());

      // 6. Verify order exists in database
      await this.step('Order Verification', () => this.verifyOrderCreation(orderResult.order_id));

      console.log('\n🎉 **COMPLETE SUCCESS**: Full Agentic Commerce flow working!');
      console.log('Your checkout sessions API is ready for ChatGPT integration 🔗');
      console.log(`Test order ID: ${orderResult.order_id}`);

      if (orderResult.payment_url) {
        console.log(`💳 Complete payment at: ${orderResult.payment_url}`);
      }

    } catch (error) {
      console.error('\nTEST FAILED:', error.message);
      console.log('\nTroubleshooting:');
      console.log('1. Make sure dev server is running: npm run dev');
      console.log('2. Check products exist in database');
      console.log('3. Verify Stripe configuration');
      process.exit(1);
    }
  }
}

// Run the full simulation
const simulator = new ChatGPTSimulator();
simulator.runFullTest();
