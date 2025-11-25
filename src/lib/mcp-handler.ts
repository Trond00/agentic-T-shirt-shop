// Official MCP Server implementation for Agentic T-shirt Shop
// Following OpenAI examples exactly

import { NextRequest, NextResponse } from "next/server";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type CallToolRequest,
  type ListToolsRequest,
  type Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { getProductBySlugServer } from "./supabase/products-server";
import { getProducts as getProductsFromClient } from "./supabase/products";
import { CatalogFilters } from "./types";

// T-shirt shop tool input schema matching CatalogFilters
const toolInputSchema = {
  type: "object",
  properties: {
    limit: {
      type: "number",
      description: "Number of products to return",
      default: 10,
    },
    page: {
      type: "number",
      description: "Page number for pagination",
      default: 1,
    },
    category: {
      type: "string",
      description: "Filter by category slug",
    },
    search: {
      type: "string",
      description: "Search query for products",
    },
    sort: {
      type: "string",
      description: "Sort order",
      enum: ['name-asc', 'name-desc', 'price-asc', 'price-desc', 'newest'],
      default: 'newest',
    },
  },
  additionalProperties: false,
} as const;

const toolInputParser = z.object({
  limit: z.number().optional().default(10),
  page: z.number().optional().default(1),
  category: z.string().optional(),
  search: z.string().optional(),
  sort: z.enum(['name-asc', 'name-desc', 'price-asc', 'price-desc', 'newest']).optional().default('newest'),
});

function createTshirtServer(): Server {
  const server = new Server(
    {
      name: "agentic-tshirt-shop",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Define tools exactly like OpenAI example
  const tools: Tool[] = [
    {
      name: "getProducts",
      description: "Get a list of t-shirt products from the catalog",
      inputSchema: toolInputSchema,
      title: "List T-shirts",
    },
    {
      name: "getProductBySlug",
      description: "Get detailed information about a specific t-shirt",
      inputSchema: {
        type: "object",
        properties: {
          slug: {
            type: "string",
            description: "Product slug identifier",
          },
        },
        required: ["slug"],
        additionalProperties: false,
      } as const,
      title: "Product Details",
    },
  ];

  server.setRequestHandler(
    ListToolsRequestSchema,
    async (_request: ListToolsRequest) => ({
      tools,
    })
  );

  server.setRequestHandler(
    CallToolRequestSchema,
    async (request: CallToolRequest) => {
      try {
        if (request.params.name === "getProducts") {
          const args = toolInputParser.parse(request.params.arguments ?? {});

          // Convert to CatalogFilters format
          const filters: CatalogFilters = {
            limit: args.limit,
            page: args.page,
            category: args.category || '',
            search: args.search || '',
            sort: args.sort,
          };

          const result = await getProductsFromClient(filters);

          return {
            content: [
              {
                type: "text",
                text: `Found ${result.products.length} t-shirt products (${result.totalCount} total)`,
              },
            ],
            structuredContent: {
              products: result.products,
              totalCount: result.totalCount,
              page: args.page,
              limit: args.limit,
            },
          };
        }

        if (request.params.name === "getProductBySlug") {
          const slug = request.params.arguments?.slug;

          if (!slug || typeof slug !== 'string') {
            throw new Error("Missing required parameter: slug");
          }

          const product = await getProductBySlugServer(slug);

          if (!product) {
            return {
              content: [
                {
                  type: "text",
                  text: `Product with slug "${slug}" not found`,
                },
              ],
              structuredContent: {
                found: false,
                slug: slug,
              },
            };
          }

          return {
            content: [
              {
                type: "text",
                text: `Found product: ${product.name} - $${(product.unit_amount / 100).toFixed(2)}`,
              },
            ],
            structuredContent: {
              product: product,
              found: true,
            },
          };
        }

        throw new Error(`Unknown tool: ${request.params.name}`);
      } catch (error) {
        console.error("Tool execution error:", error);
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          structuredContent: {
            error: error instanceof Error ? error.message : "Unknown error",
          },
        };
      }
    }
  );

  return server;
}

export function createServerTransport(
  postPath: string,
  res: NextResponse
): SSEServerTransport {
  return new SSEServerTransport(postPath, res as any);
}

export function createMcpServer(): Server {
  return createTshirtServer();
}
