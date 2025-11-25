// src/app/lib/mcp-handler.ts
import { NextRequest, NextResponse } from "next/server";
import type { McpServer } from "./mcp-server";

export async function handleMcpRequest(
  request: NextRequest,
  server: McpServer
): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { method, params, id } = body;

    if (method === "initialize") {
      const protocolVersion = "2024-11-05";

      const response = {
        jsonrpc: "2.0" as const,
        id,
        result: {
          protocolVersion,
          capabilities: {
            tools: {
              // matches your GET /api/mcp metadata
              listChanged: true,
            },
            // you can add these later if you implement them
            // resources: {},
            // prompts: {},
          },
          serverInfo: {
            name: "agentic-tshirt-shop",
            version: "1.0.0",
          },
          // optional, but some clients like having this
          instructions:
            "MCP server for the Agentic T-shirt Shop, exposes catalog tools like getProducts and showProduct.",
        },
      };

      return NextResponse.json(response, {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "https://chatgpt.com",
        },
      });
    }

    // For other methods, use the server's handler
    const response = await server.handleRequest(body);

    return NextResponse.json(response, {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://chatgpt.com",
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
          "Access-Control-Allow-Origin": "https://chatgpt.com",
          "Content-Type": "application/json",
        },
      }
    );
  }
}
