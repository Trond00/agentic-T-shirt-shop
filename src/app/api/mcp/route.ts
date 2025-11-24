import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';
import { getProducts } from '@/lib/supabase/products';
import { getProductBySlug } from '@/lib/supabase/products';
import { CatalogFilters } from '@/lib/types';

// MCP Server Info
const serverInfo = {
  name: "agentic-tshirt-shop",
  version: "1.0.0",
  description: "Agentic T-shirt Shop MCP Server - Browse and display T-shirt products",
};

const resourceOrigin = (() => {
  try {
    return new URL(config.baseURL).origin;
  } catch {
    return "http://localhost:3000";
  }
})();

// Define available tools
const tools = {
  "getProducts": {
    name: "getProducts",
    description: "Get all T-shirt products from the Agentic Shop catalog",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Maximum number of products to return (default: 20)",
          default: 20
        },
        category: {
          type: "string",
          description: "Filter by category slug"
        }
      }
    }
  },
  "showProduct": {
    name: "showProduct",
    description: "Show a specific T-shirt product from the Agentic Shop",
    inputSchema: {
      type: "object",
      properties: {
        slug: {
          type: "string",
          description: "The slug of the product to show",
        }
      },
      required: ["slug"]
    },
    _meta: {
      "openai/outputTemplate": "ui://widget/show-product.html",
      "openai/toolInvocation/invoking": "Showing a product...",
      "openai/toolInvocation/invoked": "Showed a product!",
    }
  }
};

// Define available resources
const resources = {
  "show-product-html": {
    uri: "ui://widget/show-product.html",
    name: "Product Display Widget",
    description: "HTML widget for displaying T-shirt products",
    mimeType: "text/html+skybridge",
    text: `
<div id="tanstack-app-root"></div>
<script src="${resourceOrigin}/mcp-widget.js"></script>
    `.trim(),
    _meta: {
      "openai/widgetDomain": "https://chatgpt.com",
      "openai/widgetDescription": "Displays a T-shirt product with styling",
      "openai/widgetCSP": {
        connect_domains: [resourceOrigin],
        resource_domains: [resourceOrigin],
      },
    }
  }
};

// Tool implementations
async function callTool(toolName: string, args: any) {
  switch (toolName) {
    case "getProducts":
      return await getAllProducts(args);
    case "showProduct":
      return await showProduct(args.slug);
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

async function getAllProducts(args: { limit?: number; category?: string } = {}) {
  try {
    const filters: CatalogFilters = {
      search: '',
      category: args.category || '',
      sort: 'newest',
      page: 1,
      limit: Math.min(args.limit || 20, 50),
    };

    const { products } = await getProducts(filters);

    const transformedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description || `${product.name} - High quality product`,
      price: (product.unit_amount / 100).toFixed(2),
      currency: product.currency,
      category: product.category?.name || 'General',
      image_url: product.image_url ? `${resourceOrigin}/api/products/${product.slug}/image` : null,
      product_url: `${resourceOrigin}/products/${product.slug}`,
      in_stock: product.inventory_count > 0,
      stock_count: product.inventory_count,
    }));

    return [{
      type: "text",
      text: JSON.stringify(transformedProducts, null, 2)
    }];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [{ type: "text", text: "Error fetching products" }];
  }
}

async function showProduct(slug: string) {
  try {
    const product = await getProductBySlug(slug);

    if (!product) {
      return [{ type: "text", text: "Product not found" }];
    }

    const transformedProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description || `${product.name} - High quality product`,
      price: (product.unit_amount / 100).toFixed(2),
      currency: product.currency,
      category: product.category?.name || 'General',
      image_url: product.image_url ? `${resourceOrigin}/api/products/${product.slug}/image` : null,
      product_url: `${resourceOrigin}/products/${product.slug}`,
      in_stock: product.inventory_count > 0,
      stock_count: product.inventory_count,
      rating: product.averageRating,
      review_count: product.reviewCount,
    };

    return [{
      type: "text",
      text: JSON.stringify(transformedProduct, null, 2)
    }];
  } catch (error) {
    console.error('Error fetching product:', error);
    return [{ type: "text", text: "Error fetching product" }];
  }
}

export async function GET() {
  return new Response(
    JSON.stringify({
      ...serverInfo,
      capabilities: {
        tools: { listChanged: true },
        resources: { listChanged: true },
      },
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    const { method, params, id } = await request.json();
    let result;

    switch (method) {
      case "tools/list":
        result = { tools: Object.values(tools) };
        break;

      case "tools/call":
        const { name, arguments: args } = params;
        result = { content: await callTool(name, args) };
        break;

      case "resources/list":
        result = { resources: Object.values(resources) };
        break;

      case "resources/read":
        const resourceName = params.uri.replace("ui://widget/", "").replace(".html", "");
        const resource = resources[resourceName as keyof typeof resources];
        if (resource) {
          result = { contents: [resource] };
        } else {
          result = { error: { code: -32000, message: "Resource not found" } };
        }
        break;

      default:
        result = { error: { code: -32601, message: "Method not found" } };
    }

    return new Response(
      JSON.stringify({ jsonrpc: "2.0", id, result }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error('MCP request error:', error);
    return new Response(
      JSON.stringify({
        jsonrpc: "2.0",
        error: { code: -32000, message: "Internal server error" }
      }),
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
        },
      }
    );
  }
}
