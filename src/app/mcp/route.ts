import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getProducts, getProductBySlug } from "@/lib/supabase/products";
import { CatalogFilters } from "@/lib/types";
import { config } from "@/lib/config";

const server = new McpServer({
  name: "t-shirt-shop",
  version: "1.0.0",
});

const resourceOrigin = (() => {
  try {
    return new URL(config.baseURL).origin;
  } catch {
    return "http://localhost:3000";
  }
})();

const widgetResource = {
  contents: [
    {
      uri: "ui://widget/show-product.html",
      mimeType: "text/html+skybridge",
          text: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-family: Arial, sans-serif;
      padding: 20px;
      margin: 0;
      min-height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .content {
      font-size: 18px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="content">Product Widget - Coming Soon!</div>
</body>
</html>
          `.trim(),
      _meta: {
        "openai/widgetDomain": "https://chatgpt.com",
        "openai/widgetDescription": "Displays a product with pricing and purchase options",
        "openai/widgetCSP": {
          connect_domains: [resourceOrigin],
          resource_domains: [resourceOrigin],
        },
      },
    },
  ],
};

server.registerTool(
  "getProducts",
  {
    description: "Get all t-shirt products from the catalog",
  },
  async () => {
    try {
      const filters: CatalogFilters = {
        limit: 10,
        page: 1,
        category: '',
        search: '',
        sort: 'newest',
      };
      const result = await getProducts(filters);
      return {
        content: [{ type: "text", text: JSON.stringify(result.products) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: "Error fetching products" }],
      };
    }
  }
);

server.registerTool(
  "getProductBySlug",
  {
    description: "Get detailed information about a specific t-shirt product",
    inputSchema: {
      slug: z.string().describe("The unique slug identifier of the product"),
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
      return {
        content: [{ type: "text", text: JSON.stringify(product) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: "Error fetching product" }],
      };
    }
  }
);

server.registerTool(
  "showProduct",
  {
    description: "Show a t-shirt product with visual display",
    inputSchema: {
      slug: z.string().describe("The slug of the product to show"),
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
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(product),
          },
        ],
        structuredContent: product as any,
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: "Error loading product" }],
      };
    }
  }
);

async function handleMCPRequest(request: Request, server: McpServer) {
  try {
    const body = await request.json();

    // Simple MCP request handler
    if (body.method === "tools/list") {
      return new Response(JSON.stringify({
        tools: [
          {
            name: "getProducts",
            description: "Get all t-shirt products from the catalog",
          },
          {
            name: "getProductBySlug",
            description: "Get detailed information about a specific t-shirt product",
            inputSchema: {
              type: "object",
              properties: {
                slug: {
                  type: "string",
                  description: "The unique slug identifier of the product",
                },
              },
              required: ["slug"],
            },
          },
          {
            name: "showProduct",
            description: "Show a t-shirt product with visual display",
            inputSchema: {
              type: "object",
              properties: {
                slug: {
                  type: "string",
                  description: "The slug of the product to show",
                },
              },
              required: ["slug"],
            },
            _meta: {
              "openai/outputTemplate": "ui://widget/show-product.html",
              "openai/toolInvocation/invoking": "Showing product...",
              "openai/toolInvocation/invoked": "Product displayed!",
            },
          },
        ],
      }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    if (body.method === "tools/call") {
      const { name, arguments: args } = body.params || {};

      let result;
      switch (name) {
        case "getProducts":
          try {
            const filters: CatalogFilters = {
              limit: 10,
              page: 1,
              category: '',
              search: '',
              sort: 'newest',
            };
            const productsResult = await getProducts(filters);
            result = {
              content: [{ type: "text", text: JSON.stringify(productsResult.products) }],
            };
          } catch (error) {
            result = {
              content: [{ type: "text", text: "Error fetching products" }],
            };
          }
          break;

        case "getProductBySlug":
          try {
            const { slug } = args as { slug: string };
            const product = await getProductBySlug(slug);
            if (!product) {
              result = {
                content: [{ type: "text", text: "Product not found" }],
              };
            } else {
              result = {
                content: [{ type: "text", text: JSON.stringify(product) }],
              };
            }
          } catch (error) {
            result = {
              content: [{ type: "text", text: "Error fetching product" }],
            };
          }
          break;

        case "showProduct":
          try {
            const { slug } = args as { slug: string };
            const product = await getProductBySlug(slug);
            if (!product) {
              result = {
                content: [{ type: "text", text: "Product not found" }],
              };
            } else {
              result = {
                content: [
                  {
                    type: "text",
                    text: JSON.stringify(product),
                  },
                ],
                structuredContent: product as any,
              };
            }
          } catch (error) {
            result = {
              content: [{ type: "text", text: "Error loading product" }],
            };
          }
          break;

        default:
          throw new Error(`Unknown tool: ${name}`);
      }

      return new Response(JSON.stringify(result), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    if (body.method === "resources/list") {
      return new Response(JSON.stringify({
        resources: [
          {
            uri: "ui://widget/show-product.html",
            name: "Product Display Widget",
            description: "Widget for displaying t-shirt products",
            mimeType: "text/html+skybridge",
          },
        ],
      }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    if (body.method === "resources/read") {
      const { uri } = body.params || {};
      if (uri === "ui://widget/show-product.html") {
        const resource = {
          contents: [
            {
              uri: "ui://widget/show-product.html",
              mimeType: "text/html+skybridge",
              text: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-family: Arial, sans-serif;
      padding: 20px;
      margin: 0;
      min-height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .content {
      font-size: 18px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="content">Product Widget - Coming Soon!</div>
</body>
</html>
              `.trim(),
              _meta: {
                "openai/widgetDomain": "https://chatgpt.com",
                "openai/widgetDescription": "Displays a t-shirt product with pricing and purchase options",
                "openai/widgetCSP": {
                  connect_domains: [resourceOrigin],
                  resource_domains: [resourceOrigin],
                },
              },
            },
          ],
        };

        return new Response(JSON.stringify(resource), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }
    }

    return new Response(JSON.stringify({ error: "Method not found" }), {
      status: 404,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });

  } catch (error) {
    console.error("MCP request error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}

export async function POST(request: Request) {
  return await handleMCPRequest(request, server);
}

export async function GET() {
  return new Response(
    JSON.stringify({
      name: "t-shirt-shop",
      version: "1.0.0",
      description: "T-shirt shop MCP Server",
      capabilities: {
        tools: true,
        resources: true,
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
