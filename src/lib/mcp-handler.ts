import { McpServer } from './mcp-server';
import { NextRequest, NextResponse } from 'next/server';

export async function handleMcpRequest(
  request: NextRequest,
  server: any
): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { method, params, id } = body;

    // Handle initialize method directly
    if (method === "initialize") {
      const response = {
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: params?.protocolVersion || "2024-11-05",
          capabilities: {
            tools: {},
          },
          serverInfo: {
            name: "agentic-tshirt-shop",
            version: "1.0.0",
          }
        }
      };
      return NextResponse.json(response, {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // For other methods, use the server's handler
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
