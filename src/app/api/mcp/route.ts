import { McpServer } from "@/lib/mcp-server";
import { NextRequest, NextResponse } from "next/server";
import { handleMcpRequest } from "@/lib/mcp-handler";
import { config } from "@/lib/config";
import { getProducts } from '@/lib/supabase/products';
import { getProductBySlug } from '@/lib/supabase/products';
import { CatalogFilters } from '@/lib/types';

const server = new McpServer({
  name: "agentic-tshirt-shop",
  version: "1.0.0",
});

const resourceOrigin = (() => {
  try {
    return new URL(config.baseURL).origin;
  } catch {
    return "http://localhost:3000";
  }
})();

server.registerTool(
  "getProducts",
  {
    description: "Get all T-shirt products from the Agentic Shop catalog",
  },
  async () => {
    try {
      const filters: CatalogFilters = {
        search: '',
        category: '',
        sort: 'newest',
        page: 1,
        limit: 20,
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

      return {
        content: [{ type: "text", text: JSON.stringify(transformedProducts) }],
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      return {
        content: [{ type: "text", text: "Error fetching products" }],
      };
    }
  }
);

server.registerTool(
  "showProduct",
  {
    description: "Show a T-shirt product from the Agentic Shop",
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string", description: "The slug of the product to show" }
      },
      required: ["slug"]
    },
    _meta: {
      "openai/outputTemplate": "ui://widget/show-product.html",
      "openai/toolInvocation/invoking": "Showing a product...",
      "openai/toolInvocation/invoked": "Showed a product!",
    },
  },
  async ({ slug }) => {
    try {
      const product = await getProductBySlug(slug);

      if (!product) {
        return {
          content: [{ type: "text", text: "Product not found" }],
        };
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

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(transformedProduct),
          },
        ],
        structuredContent: transformedProduct,
      };
    } catch (error) {
      console.error('Error fetching product:', error);
      return {
        content: [{ type: "text", text: "Error fetching product" }],
      };
    }
  }
);



export async function GET() {
  return new Response(
    JSON.stringify({
      name: "agentic-tshirt-shop",
      version: "1.0.0",
      description: "Agentic T-shirt Shop MCP Server",
      capabilities: {
        tools: {
          listChanged: true
        },
        resources: {
          listChanged: true
        }
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
  return await handleMcpRequest(request, server);
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Max-Age": "86400",
    },
  });
}
