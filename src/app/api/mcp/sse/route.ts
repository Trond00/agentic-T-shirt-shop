// SSE endpoint for MCP - simplified Next.js compatible implementation
import { NextRequest } from "next/server";
import { createMcpServer } from "@/lib/mcp-handler";

// Shared session storage with messages endpoint
const sessions = new Map<string, any>();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  // Create plain text SSE response using Next.js approach
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      if (!sessionId) {
        // Generate new session ID for first connection
        const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        try {
          // Create server for this session
          const server = createMcpServer();
          const transport = {
            postPath: `/api/mcp/messages?sessionId=${newSessionId}`,
            sessionId: newSessionId,
            server,
            isConnected: true,
          };

          sessions.set(newSessionId, transport);

          // Send session created event
          controller.enqueue(encoder.encode(`event: session-created\ndata: ${JSON.stringify({ sessionId: newSessionId })}\n\n`));
          controller.enqueue(encoder.encode(`event: connected\ndata: ${JSON.stringify({
            message: 'MCP SSE connection established',
            sessionId: newSessionId
          })}\n\n`));

        } catch (error: unknown) {
          console.error('SSE setup error:', error);
          controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({
            error: 'Failed to establish MCP connection',
            details: error instanceof Error ? error.message : 'Unknown error'
          })}\n\n`));
          controller.close();
        }
        return;
      }

      // Handle reconnection
      const session = sessions.get(sessionId);

      if (!session) {
        controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ error: 'Session not found' })}\n\n`));
        controller.close();
        return;
      }

      controller.enqueue(encoder.encode(`event: status\ndata: ${JSON.stringify({ message: 'Reconnected to session', sessionId })}\n\n`));

      // Keep heartbeat
      const heartbeat = setInterval(() => {
        if (session.isConnected) {
          controller.enqueue(encoder.encode(`event: heartbeat\ndata: ${JSON.stringify({ timestamp: Date.now() })}\n\n`));
        } else {
          clearInterval(heartbeat);
          controller.close();
        }
      }, 30000);

      // Cleanup on disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        controller.close();
      });
    },

    cancel() {
      console.log('SSE stream cancelled');
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "content-type",
      "Access-Control-Expose-Headers": "content-type",
    },
  });
}
