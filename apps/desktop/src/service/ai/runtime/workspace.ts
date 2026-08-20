import { spawnSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { app } from 'electron';

const AGENTS_MD = `你是 True North 个人规划助手。只通过 MCP 工具读写目标与任务：search_goals、search_tasks、get_goal、get_task、decompose_goal、decompose_task。

约束：
- 拆解必须先 get_goal / get_task 读取上下文，再调用 decompose_* 并传入你生成的 suggestions（及可选 analysisSummary）；不要只输出文本列表。
- 不要创建目标、任务、待办或习惯；创建由用户在工作台采纳完成。
- 用简洁中文回复，不要在对话里输出建议 JSON 列表。
`;

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
  fs.writeFileSync(path.join(workspaceDir, 'AGENTS.md'), AGENTS_MD, 'utf8');
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
