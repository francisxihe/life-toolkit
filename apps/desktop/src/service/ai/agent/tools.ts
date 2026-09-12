import { z } from 'zod';
import type { AiWorkspacePartVo } from '@true-north/vo';

export type ToolExecutionContext = {
  appendWorkspace: (part: AiWorkspacePartVo) => void;
};

export type AgentTool = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  schema: z.ZodTypeAny;
  readOnly?: boolean;
  execute: (args: Record<string, unknown>, ctx: ToolExecutionContext) => Promise<string>;
};

export class AgentToolRegistry {
  private readonly tools: AgentTool[] = [];
  private readonly byName = new Map<string, AgentTool>();

  register(tools: AgentTool[]) {
    for (const tool of tools) {
      if (this.byName.has(tool.name)) {
        throw new Error(`重复注册工具: ${tool.name}`);
      }
      this.tools.push(tool);
      this.byName.set(tool.name, tool);
    }
  }

  list(): AgentTool[] {
    return this.tools;
  }

  find(name: string): AgentTool | undefined {
    return this.byName.get(name);
  }
}

let attached: AgentToolRegistry | null = null;

export function attachAgentToolRegistry(registry: AgentToolRegistry) {
  attached = registry;
}

export function findAgentTool(name: string): AgentTool | undefined {
  if (!attached) throw new Error('Agent tools are not attached');
  return attached.find(name);
}

export function listAgentTools(): AgentTool[] {
  if (!attached) throw new Error('Agent tools are not attached');
  return attached.list();
}

function summarizeArgs(args: Record<string, unknown>): string {
  const entries = Object.entries(args)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([key, value]) => {
      if (Array.isArray(value)) return `${key}=${value.length}项`;
      return `${key}=${String(value)}`;
    })
    .slice(0, 3);
  return entries.join(', ');
}

export function summarizeToolArgs(args: Record<string, unknown>): string {
  return summarizeArgs(args);
}

export async function executeAgentTool(
  name: string,
  args: Record<string, unknown>,
  ctx: ToolExecutionContext
): Promise<{ ok: boolean; result: string; args: Record<string, unknown> }> {
  const tool = findAgentTool(name);
  if (!tool) {
    return { ok: false, result: `未知工具: ${name}`, args };
  }
  try {
    const parsed = tool.schema.parse(args) as Record<string, unknown>;
    const result = await tool.execute(parsed, ctx);
    return { ok: true, result, args: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        ok: false,
        result: '工具参数无效，请按该工具 schema 修正后重试。',
        args,
      };
    }
    const message = error instanceof Error ? error.message : '工具执行失败';
    return { ok: false, result: message, args };
  }
}

export function parseToolArguments(raw: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(raw || '{}');
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return {};
  } catch {
    return {};
  }
}
