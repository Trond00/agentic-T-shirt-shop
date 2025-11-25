// Old HTTP endpoint - now provides info about SSE endpoints
export async function GET() {
  return new Response(JSON.stringify({
    name: "agentic-tshirt-shop",
    version: "1.0.0",
    message: "MCP SSE implementation complete! Use SSE endpoints for ChatGPT connection.",
    endpoints: {
      sse: "/api/mcp/sse",
      messages: "/api/mcp/messages"
    },
    tools: [
      "getProducts - List t-shirt products from catalog",
      "getProductBySlug - Get detailed product information"
    ]
  }), {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json"
    }
  });
}

export async function POST() {
  return new Response(JSON.stringify({
    error: "MCP moved to SSE endpoints",
    message: "Please use SSE endpoint: /api/mcp/sse",
    endpoints: {
      sse: "/api/mcp/sse",
      messages: "/api/mcp/messages"
    }
  }), {
    status: 410, // Gone
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json"
    }
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: { "Access-Control-Allow-Origin": "*" }
  });
}
