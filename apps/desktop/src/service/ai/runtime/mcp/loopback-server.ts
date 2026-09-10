import http from 'http';
import type { IncomingMessage, ServerResponse } from 'http';
import { randomUUID } from 'crypto';
import type { AiMessagePartVo, AiToolPartVo, AiWorkspacePartVo } from '@true-north/vo';
import { agentTools, executeAgentTool, summarizeToolArgs } from '../../agent/tools';
import { traceExternal } from '@true-north/dev-lab/collector';
import { getStreamSession } from '../stream-session';

const PROTOCOL_VERSIONS = ['2025-03-26', '2024-11-05'];
const DEFAULT_PROTOCOL = '2025-03-26';

let server: http.Server | null = null;
let port: number | null = null;

type JsonRpcRequest = {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: Record<string, unknown>;
};

function streamIdOf(req: IncomingMessage, url: URL): string | undefined {
  const fromQuery = url.searchParams.get('s') || url.searchParams.get('streamId');
  if (fromQuery) return fromQuery;
  const fromHeader = req.headers['x-true-north-stream'];
  if (typeof fromHeader === 'string' && fromHeader.trim()) return fromHeader.trim();
  const match = url.pathname.match(/\/mcp\/([^/]+)/);
  return match?.[1];
}

function sendJson(res: ServerResponse, status: number, body: unknown, sessionId?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
  };
  if (sessionId) headers['Mcp-Session-Id'] = sessionId;
  res.writeHead(status, headers);
  res.end(JSON.stringify(body));
}

function sendSse(res: ServerResponse, body: unknown, sessionId?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  };
  if (sessionId) headers['Mcp-Session-Id'] = sessionId;
  res.writeHead(200, headers);
  res.write(`event: message\ndata: ${JSON.stringify(body)}\n\n`);
  res.end();
}

function wantsSse(req: IncomingMessage): boolean {
  const accept = String(req.headers.accept || '');
  return accept.includes('text/event-stream') && !accept.includes('application/json');
}

async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

function cloneParts(parts: AiMessagePartVo[]): AiMessagePartVo[] {
  return parts.map((part) => ({ ...part }));
}

function summarizeToolResult(result: string, error?: boolean): string {
  if (error) return result.slice(0, 180);
  try {
    const parsed = JSON.parse(result) as { suggestionCount?: number; items?: unknown[] };
    if (typeof parsed.suggestionCount === 'number') {
      return `已生成 ${parsed.suggestionCount} 条建议`;
    }
    if (Array.isArray(parsed.items)) {
      return `找到 ${parsed.items.length} 条`;
    }
  } catch {
    // ignore
  }
  return result.slice(0, 120);
}

async function callTool(streamId: string | undefined, name: string, args: Record<string, unknown>) {
  const session = streamId ? getStreamSession(streamId) : undefined;
  if (!session) {
    return {
      isError: true,
      content: [{ type: 'text', text: '当前没有绑定的会话流，无法执行领域工具。' }],
    };
  }

  const running: AiToolPartVo = {
    type: 'tool',
    toolName: name,
    argsSummary: summarizeToolArgs(args),
    status: 'running',
  };
  session.parts = [...cloneParts(session.parts), running];
  await session.persistParts(session.parts);

  const executed = await executeAgentTool(name, args, {
    appendWorkspace: (part: AiWorkspacePartVo) => {
      session.parts = [...cloneParts(session.parts), part];
    },
  });

  let runningIndex = -1;
  for (let index = session.parts.length - 1; index >= 0; index -= 1) {
    const part = session.parts[index];
    if (part.type === 'tool' && part.status === 'running' && part.toolName === name) {
      runningIndex = index;
      break;
    }
  }
  session.parts = cloneParts(session.parts).map((part, index) => {
    if (index !== runningIndex || part.type !== 'tool') return part;
    return {
      ...part,
      argsSummary: summarizeToolArgs(executed.args),
      status: executed.ok ? 'done' : 'error',
      resultSummary: summarizeToolResult(executed.result, !executed.ok),
    };
  });
  await session.persistParts(session.parts);

  return {
    isError: !executed.ok,
    content: [{ type: 'text', text: executed.result }],
  };
}

async function handleRpc(message: JsonRpcRequest, streamId?: string): Promise<unknown | null> {
  const method = message.method || '';
  const params = message.params || {};

  if (method === 'initialize') {
    const requested = typeof params.protocolVersion === 'string' ? params.protocolVersion : DEFAULT_PROTOCOL;
    const protocolVersion = PROTOCOL_VERSIONS.includes(requested) ? requested : DEFAULT_PROTOCOL;
    return {
      protocolVersion,
      capabilities: { tools: { listChanged: false } },
      serverInfo: { name: 'true-north', version: '0.2.0' },
    };
  }

  if (method === 'notifications/initialized' || method === 'notifications/cancelled') {
    return null;
  }

  if (method === 'ping') {
    return {};
  }

  if (method === 'tools/list') {
    const readOnlyTools = new Set(['search_goals', 'search_tasks', 'get_goal', 'get_task']);
    return {
      tools: agentTools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.parameters,
        ...(readOnlyTools.has(tool.name) ? { annotations: { readOnlyHint: true } } : {}),
      })),
    };
  }

  if (method === 'tools/call') {
    const name = typeof params.name === 'string' ? params.name : '';
    const args =
      params.arguments && typeof params.arguments === 'object' && !Array.isArray(params.arguments)
        ? (params.arguments as Record<string, unknown>)
        : {};
    return traceExternal(
      {
        kind: 'mcp',
        streamId,
        summary: `tools/call ${name || '(unknown)'}`,
        detail: { tool: name, args: summarizeToolArgs(args) },
      },
      async (span) => {
        const result = await callTool(streamId, name, args);
        span.setDetail({
          tool: name,
          args: summarizeToolArgs(args),
          error: Boolean(result && typeof result === 'object' && 'isError' in result && result.isError),
        });
        return result;
      },
    );
  }

  if (method === 'resources/list' || method === 'prompts/list') {
    return { resources: [], prompts: [] };
  }

  throw Object.assign(new Error(`Method not found: ${method}`), { code: -32601 });
}

function wrapResult(id: JsonRpcRequest['id'], result: unknown) {
  return { jsonrpc: '2.0', id: id ?? null, result };
}

function wrapError(id: JsonRpcRequest['id'], code: number, message: string) {
  return { jsonrpc: '2.0', id: id ?? null, error: { code, message } };
}

async function handlePost(req: IncomingMessage, res: ServerResponse, url: URL) {
  const streamId = streamIdOf(req, url);
  const sessionId = (typeof req.headers['mcp-session-id'] === 'string' && req.headers['mcp-session-id']) || randomUUID();
  const raw = await readBody(req);
  let parsed: unknown;
  try {
    parsed = raw ? JSON.parse(raw) : {};
  } catch {
    sendJson(res, 400, wrapError(null, -32700, 'Parse error'), sessionId);
    return;
  }

  const messages = Array.isArray(parsed) ? parsed : [parsed];
  const responses: unknown[] = [];

  for (const item of messages) {
    const rpc = (item || {}) as JsonRpcRequest;
    const isNotification = rpc.id === undefined && typeof rpc.method === 'string' && rpc.method.startsWith('notifications/');
    try {
      const result = await handleRpc(rpc, streamId);
      if (result !== null && rpc.id !== undefined) {
        responses.push(wrapResult(rpc.id, result));
      } else if (!isNotification && rpc.id !== undefined && result === null) {
        responses.push(wrapResult(rpc.id, {}));
      }
    } catch (error) {
      const code = (error as { code?: number }).code || -32603;
      const message = error instanceof Error ? error.message : 'Internal error';
      responses.push(wrapError(rpc.id, code, message));
    }
  }

  if (!responses.length) {
    res.writeHead(202, { 'Mcp-Session-Id': sessionId });
    res.end();
    return;
  }

  const body = Array.isArray(parsed) ? responses : responses[0];
  if (wantsSse(req)) {
    sendSse(res, body, sessionId);
    return;
  }
  sendJson(res, 200, body, sessionId);
}

function handleGet(_req: IncomingMessage, res: ServerResponse) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  const timer = setInterval(() => {
    res.write(': ping\n\n');
  }, 25_000);
  _req.on('close', () => {
    clearInterval(timer);
  });
}

export function mcpUrl(streamId: string): string {
  if (!port) {
    throw new Error('Loopback MCP 尚未启动');
  }
  const encoded = encodeURIComponent(streamId);
  return `http://127.0.0.1:${port}/mcp/${encoded}?s=${encoded}`;
}

export function startMcpServer(): Promise<number> {
  if (server && port) return Promise.resolve(port);
  return new Promise((resolve, reject) => {
    server = http.createServer((req, res) => {
      const host = req.headers.host || '127.0.0.1';
      const url = new URL(req.url || '/', `http://${host}`);
      if (!url.pathname.startsWith('/mcp')) {
        res.writeHead(404);
        res.end();
        return;
      }
      if (req.method === 'GET') {
        handleGet(req, res);
        return;
      }
      if (req.method === 'DELETE') {
        res.writeHead(200);
        res.end();
        return;
      }
      if (req.method === 'POST') {
        void handlePost(req, res, url).catch(() => {
          if (!res.headersSent) {
            res.writeHead(500);
            res.end();
          }
        });
        return;
      }
      res.writeHead(405);
      res.end();
    });
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server?.address();
      if (!address || typeof address === 'string') {
        reject(new Error('无法绑定 loopback MCP 端口'));
        return;
      }
      port = address.port;
      resolve(port);
    });
  });
}

export function stopMcpServer(): Promise<void> {
  return new Promise((resolve) => {
    if (!server) {
      port = null;
      resolve();
      return;
    }
    server.close(() => {
      server = null;
      port = null;
      resolve();
    });
  });
}
