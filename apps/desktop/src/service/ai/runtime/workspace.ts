import { spawnSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { app } from 'electron';
import { listAgentTools } from '../agent/tools';
import { getAgentInstructions } from './agent-instructions';

function buildAgentsMd(): string {
  const tools = listAgentTools();
  const names = tools.map((tool) => tool.name).join('、');
  const domain = getAgentInstructions();
  return `你是 True North 个人规划助手。${names ? `通过 MCP 工具完成领域读写：${names}。` : ''}

${domain}

约束：
- 不要创建目标、任务、待办、习惯、支出、采购或收藏；创建由用户在工作台采纳完成。
- 用简洁中文回复，不要在对话里输出建议 JSON 列表。
`;
}

export function runtimeRootDir(): string {
  return path.join(app.getPath('userData'), 'ai-runtime');
}

export function conversationWorkspaceDir(conversationId: string): string {
  return path.join(runtimeRootDir(), 'workspaces', conversationId);
}

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeAgentsMd(workspaceDir: string) {
  fs.writeFileSync(path.join(workspaceDir, 'AGENTS.md'), buildAgentsMd(), 'utf8');
  try {
    spawnSync('git', ['init'], { cwd: workspaceDir, stdio: 'ignore', timeout: 5_000 });
  } catch {
    // isolated dir is not required to be a git repo; Codex may use --skip-git-repo-check
  }
}

export function prepareCodexWorkspace(workspaceDir: string, mcpUrl: string): string {
  ensureDir(workspaceDir);
  writeAgentsMd(workspaceDir);
  const codexHome = path.join(workspaceDir, '.codex');
  ensureDir(codexHome);

  const userCodexHome = path.join(os.homedir(), '.codex');
  let userConfig = '';
  try {
    userConfig = fs.readFileSync(path.join(userCodexHome, 'config.toml'), 'utf8');
  } catch {
    userConfig = '';
  }
  const stripped = userConfig.replace(/\[mcp_servers\.true_north\][\s\S]*?(?=\n\[|$)/g, '').trim();
  const nextConfig = `${stripped ? `${stripped}\n\n` : ''}[mcp_servers.true_north]\nurl = "${mcpUrl}"\ndefault_tools_approval_mode = "approve"\n`;
  fs.writeFileSync(path.join(codexHome, 'config.toml'), nextConfig, 'utf8');

  for (const name of ['auth.json']) {
    const from = path.join(userCodexHome, name);
    const to = path.join(codexHome, name);
    if (!fs.existsSync(from) || fs.existsSync(to)) continue;
    try {
      fs.symlinkSync(from, to);
    } catch {
      try {
        fs.copyFileSync(from, to);
      } catch {
        // probe/login still uses the user home; spawn can fail as unauthenticated
      }
    }
  }

  return codexHome;
}
