// Simple test script to validate JSON-LD structured data
// Run with: node test-jsonld.js

const API_BASE = 'http://localhost:3000';

async function testJsonLd() {
  console.log('🧪 Testing JSON-LD Structured Data\n');

  try {
    // Test product page
    console.log('Testing product page JSON-LD...');
    const response = await fetch(`${API_BASE}/products/basic-tee`);
    const html = await response.text();

    // Extract JSON-LD from HTML
    const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);

    if (jsonLdMatch) {
      const jsonLdString = jsonLdMatch[1];
      console.log('✅ JSON-LD found in HTML');

      try {
        const jsonLd = JSON.parse(jsonLdString);
        console.log('✅ JSON-LD is valid JSON');
        console.log('📋 Structured Data:');
        console.log('   @type:', jsonLd['@type']);
        console.log('   name:', jsonLd.name);
        console.log('   price:', jsonLd.offers?.price);
        console.log('   currency:', jsonLd.offers?.priceCurrency);
        console.log('   availability:', jsonLd.offers?.availability);
        if (jsonLd.aggregateRating) {
          console.log('   rating:', jsonLd.aggregateRating.ratingValue);
          console.log('   reviewCount:', jsonLd.aggregateRating.reviewCount);
        }
      } catch (parseError) {
        console.log('❌ JSON-LD is not valid JSON:', parseError.message);
      }
    } else {
      console.log('❌ No JSON-LD found in HTML');
    }

    console.log('\n🎉 JSON-LD testing complete!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testJsonLd();
