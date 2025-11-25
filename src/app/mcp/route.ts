import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { getProducts, getProductBySlug } from "@/lib/supabase/products";
import { CatalogFilters } from "@/lib/types";

// T-shirt shop MCP server using official Vercel adapter
const handler = createMcpHandler(
  async (server) => {
    // getProducts tool - List t-shirt products from catalog
    server.tool(
      "getProducts",
      "Get a list of t-shirt products from the catalog",
      {
        limit: z.number().optional().default(10),
        page: z.number().optional().default(1),
        category: z.string().optional(),
        search: z.string().optional(),
        sort: z.enum(['name-asc', 'name-desc', 'price-asc', 'price-desc', 'newest']).optional().default('newest'),
      },
      async ({ limit, page, category, search, sort }) => {
        try {
          // Build filters for our cbatalog
          const filters: CatalogFilters = {
            limit,
            page,
            category: category || '',
            search: search || '',
            sort,
          };

          const result = await getProducts(filters);

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
              page,
              limit,
            },
          };
        } catch (error) {
          console.error("getProducts error:", error);
          return {
            content: [
              {
                type: "text",
                text: "Error fetching products",
              },
            ],
            structuredContent: {
              error: error instanceof Error ? error.message : "Unknown error",
            },
          };
        }
      }
    );

    // getProductBySlug tool - Get detailed product info
    server.tool(
      "getProductBySlug",
      "Get detailed information about a specific t-shirt product",
      {
        slug: z.string().min(1, "Slug is required"),
      },
      async ({ slug }) => {
        try {
          const product = await getProductBySlug(slug);

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
                slug,
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
              product,
              found: true,
            },
          };
        } catch (error) {
          console.error("getProductBySlug error:", error);
          return {
            content: [
              {
                type: "text",
                text: "Error fetching product",
              },
            ],
            structuredContent: {
              error: error instanceof Error ? error.message : "Unknown error",
            },
          };
        }
      }
    );
  },
  {
    capabilities: {
      tools: {
        getProducts: {
          description: "Get a list of t-shirt products from the catalog with filtering and pagination",
        },
        getProductBySlug: {
          description: "Get detailed information about a specific t-shirt product by slug",
        },
      },
    },
  },
  {
    basePath: "",
    verboseLogs: true,
    maxDuration: 60,
    disableSse: true, // Enable SSE transport (requires Redis)
  },
);

export { handler as GET, handler as POST, handler as DELETE };
