import { McpServer } from './mcp-server';
import { NextRequest, NextResponse } from 'next/server';

export async function handleMcpRequest(
  request: NextRequest,
  server: McpServer
): Promise<NextResponse> {
  try {
    const body = await request.json();
    const response = await server.handleRequest(body);

    return NextResponse.json(response, {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("MCP request handling error:", error);

    return NextResponse.json(
      {
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "Internal server error",
          data: error instanceof Error ? error.message : "Unknown error",
        },
        id: null,
      },
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
