export interface ToolConfig {
  name: string;
  description: string;
  inputSchema?: {
    type: string;
    properties?: Record<string, any>;
    required?: string[];
  };
  _meta?: Record<string, any>;
}

export interface ResourceConfig {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
  text?: string;
  _meta?: Record<string, any>;
}

export interface ToolResult {
  content: Array<{
    type: string;
    text?: string;
  }>;
  structuredContent?: any;
}

export interface ResourceResult {
  contents: Array<{
    uri: string;
    mimeType: string;
    text?: string;
    _meta?: Record<string, any>;
  }>;
}

export class McpServer {
  private tools = new Map<string, ToolConfig & { handler: (args?: any) => Promise<ToolResult> }>();
  private resources = new Map<string, ResourceConfig & { handler: () => Promise<ResourceResult> }>();

  constructor(private info: { name: string; version: string }) {}

  registerTool(
    name: string,
    config: Omit<ToolConfig, 'name'>,
    handler: (args?: any) => Promise<ToolResult>
  ) {
    this.tools.set(name, { name, ...config, handler });
  }

  registerResource(
    uri: string,
    resourceUri: string,
    config: Omit<ResourceConfig, 'uri'>,
    handler: () => Promise<ResourceResult>
  ) {
    this.resources.set(uri, { uri: resourceUri, ...config, handler });
  }

  async handleRequest(request: {
    jsonrpc: "2.0";
    method: string;
    params?: any;
    id: string | number;
  }) {
    const { method, params, id } = request;

    try {
      switch (method) {
        case "tools/list":
          return {
            jsonrpc: "2.0",
            id,
            result: { tools: Array.from(this.tools.values()).map(({ handler, ...tool }) => tool) }
          };

        case "tools/call":
          const { name, arguments: args = {} } = params;
          const tool = this.tools.get(name);
          if (!tool) {
            return {
              jsonrpc: "2.0",
              id,
              error: { code: -32602, message: `Tool '${name}' not found` }
            };
          }

          const result = await tool.handler(args);
          return {
            jsonrpc: "2.0",
            id,
            result
          };

        case "resources/list":
          return {
            jsonrpc: "2.0",
            id,
            result: { resources: Array.from(this.resources.values()).map(({ handler, ...resource }) => resource) }
          };

        case "resources/read":
          const resource = this.resources.get(params.uri);
          if (!resource) {
            return {
              jsonrpc: "2.0",
              id,
              error: { code: -32000, message: "Resource not found" }
            };
          }

          const resourceResult = await resource.handler();
          return {
            jsonrpc: "2.0",
            id,
            result: resourceResult
          };

        default:
          return {
            jsonrpc: "2.0",
            id,
            error: { code: -32601, message: `"${method}" is not supported` }
          };
      }
    } catch (error) {
      return {
        jsonrpc: "2.0",
        id,
        error: {
          code: -32603,
          message: error instanceof Error ? error.message : "Internal error"
        }
      };
    }
  }

  getTools() {
    return Array.from(this.tools.values());
  }

  getResources() {
    return Array.from(this.resources.values());
  }
}
