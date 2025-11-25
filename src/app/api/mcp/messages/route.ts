// Message handling endpoint for MCP - using official MCP SDK
import { NextRequest } from "next/server";
import { createMcpServer } from "@/lib/mcp-handler";

// Shared session storage with SSE endpoint
const sessions = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return new Response("Missing sessionId query parameter", {
        status: 400,
        headers: { "Access-Control-Allow-Origin": "*" }
      });
    }

    let session = sessions.get(sessionId);

    // If session doesn't exist, try to create it
    if (!session) {
      console.log(`Creating new MCP server for session: ${sessionId}`);
      const server = createMcpServer();
      session = { server };
      sessions.set(sessionId, session);
    }

    // Read and process MCP request
    const message = await request.json();

    console.log(`MCP message received for session ${sessionId}:`, message.method);

    // Handle the message using the official MCP SDK approach
    const result = await session.server.handleRequest(message);

    console.log(`MCP response for session ${sessionId}:`, result);

    return new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "content-type",
      },
    });

  } catch (error: unknown) {
    console.error("MCP message processing error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    // Return proper JSON-RPC 2.0 error format
    return new Response(JSON.stringify({
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Internal server error",
        data: errorMessage,
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      id: null,
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}
