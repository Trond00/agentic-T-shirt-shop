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
          // Build filters for our catalog
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

    // showProduct tool - Visual product display with widget rendering
    server.tool(
      "showProduct",
      "Show detailed information about a specific product with visual display",
      {
        slug: z.string().describe("The unique slug identifier of the product"),
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
                text: `Loading product ${product.name}...`,
              },
            ],
            structuredContent: {
              product,
              found: true,
            },
            _meta: {
              "openai/outputTemplate": "https://agentic-t-shirt-shop.vercel.app/widgets/show-product.html",
              "openai/toolInvocation/invoking": "Showing product...",
              "openai/toolInvocation/invoked": "Product displayed!",
            },
          };
        } catch (error) {
          console.error("showProduct error:", error);
          return {
            content: [
              {
                type: "text",
                text: "Error loading product display",
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
          name: "getProducts",
          description: "Get a list of t-shirt products from the catalog with filtering and pagination",
          inputSchema: {
            type: "object",
            properties: {
              limit: {
                type: "number",
                description: "Maximum number of products to return"
              },
              page: {
                type: "number",
                description: "Page number for pagination"
              },
              category: {
                type: "string",
                description: "Product category filter"
              },
              search: {
                type: "string",
                description: "Search term to filter products"
              },
              sort: {
                type: "string",
                enum: ["name-asc", "name-desc", "price-asc", "price-desc", "newest"],
                description: "Sort order for products"
              }
            }
          }
        },
        getProductBySlug: {
          name: "getProductBySlug",
          description: "Get detailed information about a specific t-shirt product by slug",
          inputSchema: {
            type: "object",
            properties: {
              slug: {
                type: "string",
                description: "The unique slug identifier of the product"
              }
            },
            required: ["slug"]
          }
        },
        showProduct: {
          name: "showProduct",
          description: "Show a visual product display with pricing and purchase options",
          inputSchema: {
            type: "object",
            properties: {
              slug: {
                type: "string",
                description: "The unique slug identifier of the product"
              }
            },
            required: ["slug"]
          }
        },
      },
    },
  },
  {
    basePath: "",
    verboseLogs: true,
    maxDuration: 60,
    disableSse: true, // Stateless HTTP for simplicity
  },
);

export { handler as GET, handler as POST, handler as DELETE };
