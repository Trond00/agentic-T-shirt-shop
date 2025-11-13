# OpenAI Product Feed API

This API provides a ChatGPT-compatible product feed for the Agentic Shop, enabling products to appear in ChatGPT shopping experiences.

## Endpoint

```
GET /api/openai/products
```

## Response Format

Returns a JSON object containing OpenAI Product Feed compliant data:

```json
{
  "products": [
    {
      "enable_search": true,
      "enable_checkout": true,
      "id": "cf1ba303-80c4-478a-9fbc-0c7739569c23",
      "gtin": "0016542831712",
      "mpn": "CF1BA303-80C4-478A-9FBC-0C7739569C23",
      "title": "Graphic Tee",
      "description": "Premium T-shirt with printed front graphic design.",
      "link": "https://yourstore.com/products/graphic-tee",
      "condition": "new",
      "product_category": "Apparel & Accessories > Clothing > Shirts & Tops > T-Shirts",
      "brand": "Agentic Shop",
      "material": "Premium fabric",
      "dimensions": "12x8x1 in",
      "weight": "0.5 lb",
      "age_group": "adult",
      "image_link": "https://yourstore.com/api/products/graphic-tee/image",
      "price": "29.99 USD",
      "availability": "in_stock",
      "inventory_quantity": 80,
      "shipping": "US:CA:Standard:0.00 USD, US:ALL:Standard:5.99 USD",
      "seller_name": "Agentic Shop",
      "seller_url": "https://yourstore.com",
      "seller_privacy_policy": "https://yourstore.com/privacy",
      "seller_tos": "https://yourstore.com/terms",
      "return_policy": "https://yourstore.com/return",
      "return_window": 30
    }
  ],
  "_metadata": {
    "feed_format": "OpenAI Product Feed v1.0",
    "total_products": 10,
    "generated_at": "2025-11-11T11:09:42.640Z",
    "store_name": "Agentic Shop",
    "store_url": "https://yourstore.com",
    "feed_url": "https://yourstore.com/api/openai/products",
    "specification": "https://developers.openai.com/commerce/specs/feed"
  }
}
```

## Data Transformation

The API transforms your existing Supabase product data into OpenAI's required format:

### Field Mapping

- `name` → `title`
- `unit_amount/100` → `price` (formatted with currency)
- `inventory_count > 0` → `availability`
- `slug` → Product URLs
- Auto-generated: `gtin`, `mpn`, `product_category` mapping

### Smart Defaults

- **Brand**: "Agentic Shop"
- **Material**: "Premium fabric"
- **Condition**: "new"
- **Age Group**: "adult"
- **Return Window**: 30 days
- **Enable Flags**: Both search and checkout enabled

### Category Mapping

Products are automatically mapped to OpenAI's taxonomy:

- T-Shirts → "Apparel & Accessories > Clothing > Shirts & Tops > T-Shirts"
- Hoodies → "Apparel & Accessories > Clothing > Outerwear > Hoodies"
- Accessories → "Apparel & Accessories > Clothing Accessories"

## Testing

Run the test script to validate your feed:

```bash
node test-openai-feed.js
```

This will:

- ✅ Validate all required OpenAI fields are present
- ✅ Check OpenAI-specific requirements (enable flags, GTIN, etc.)
- ✅ Test URL accessibility
- ✅ Display sample product structure

## Integration with OpenAI

1. **Sign up**: Visit [chatgpt.com/merchants](https://chatgpt.com/merchants) to register
2. **Submit Feed URL**: Provide `https://yourstore.com/api/openai/products`
3. **Validation**: OpenAI will validate and index your products
4. **Go Live**: Products appear in ChatGPT shopping results

## Required Pages

Your store should have these pages (referenced in the feed):

- `/privacy` - Privacy policy
- `/terms` - Terms of service
- `/return` - Return policy

## Features

- ✅ OpenAI Product Feed Specification compliant
- ✅ Automatic GTIN generation for products without barcodes
- ✅ Category taxonomy mapping
- ✅ URL validation and accessibility
- ✅ Configurable defaults for missing data
- ✅ JSON format (easily extensible to CSV/TSV/XML)
- ✅ Comprehensive validation and testing

## Cache & Performance

- 30-minute cache headers for production performance
- CORS enabled for cross-origin access
- Up to 5000 products per feed (configurable)

## Next Steps

1. Create the required policy pages (`/privacy`, `/terms`, `/return`)
2. Submit your feed URL to OpenAI for validation
3. Monitor product discovery in ChatGPT
4. Consider adding product variants, reviews, and additional media
