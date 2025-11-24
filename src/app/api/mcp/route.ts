import { NextRequest, NextResponse } from 'next/server';
import { getProducts } from '@/lib/supabase/products';
import { getProductBySlug } from '@/lib/supabase/products';
import { CatalogFilters } from '@/lib/types';

// MCP Server Info
const serverInfo = {
  name: "agentic-tshirt-shop",
  version: "1.0.0"
};

// Define available tools with proper JSON Schema
const tools = {
  "getProducts": {
    name: "getProducts",
    description: "Get T-shirt products from the Agentic Shop catalog",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Maximum number of products to return (default: 10)"
        }
      }
    }
  },
  "showProduct": {
    name: "showProduct",
    description: "Show details of a specific T-shirt product",
    inputSchema: {
      type: "object",
      properties: {
        slug: {
          type: "string",
          description: "The slug of the product to show"
        }
      },
      required: ["slug"]
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

async function getAllProducts(args: { limit?: number } = {}) {
  try {
    const filters: CatalogFilters = {
      search: '',
      category: '',
      sort: 'newest',
      page: 1,
      limit: Math.min(args.limit || 10, 50),
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
      in_stock: product.inventory_count > 0
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
      in_stock: product.inventory_count > 0,
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
        tools: {}
      }
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
    const body = await request.json();
    const { method, params, id } = body;

    let result;

    switch (method) {
      case "tools/list":
        result = { tools: Object.values(tools) };
        break;

      case "tools/call":
        const { name, arguments: args = {} } = params;
        result = { content: await callTool(name, args) };
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
