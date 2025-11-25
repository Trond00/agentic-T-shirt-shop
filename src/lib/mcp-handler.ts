// src/app/lib/mcp-handler.ts
import { NextRequest, NextResponse } from "next/server";
import type { McpServer } from "./mcp-server";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Max-Age": "86400",
  "Content-Type": "application/json",
};

export async function handleMcpRequest(
  request: NextRequest,
  server: McpServer
): Promise<NextResponse> {
  try {
    // If someone accidentally hits this with OPTIONS directly
    if (request.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 200,
        headers: CORS_HEADERS,
      });
    }

    const body = await request.json();
    const { method, params, id } = body;

    if (method === "initialize") {
      const protocolVersion = params?.protocolVersion ?? "2024-11-05";

      const responseBody = {
        jsonrpc: "2.0" as const,
        id,
        result: {
          protocolVersion,
          capabilities: {
            tools: {
              listChanged: true,
            },
          },
          serverInfo: {
            name: "agentic-tshirt-shop",
            version: "1.0.0",
          },
          instructions:
            "MCP server for the Agentic T-shirt Shop, exposes catalog tools like getProducts and showProduct.",
        },
      };

      return NextResponse.json(responseBody, {
        headers: CORS_HEADERS,
      });
    }

    // All other MCP methods (tools/list, tools/call, resources/*, …)
    const rpcResponse = await server.handleRequest(body);

    return NextResponse.json(rpcResponse, {
      headers: CORS_HEADERS,
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
        headers: CORS_HEADERS,
      }
    );
  }
}
