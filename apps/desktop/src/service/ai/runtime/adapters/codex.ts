import { spawn, spawnSync } from 'child_process';
import path from 'path';
import { traceExternal } from '@true-north/dev-lab/collector';
import { consumeJsonl, readString } from '../jsonl';
import { registerChildProcess } from '../process-registry';
import { prepareCodexWorkspace } from '../workspace';
import type { RuntimeSpawnInput, RuntimeSpawnResult } from '../types';
import { extractCodexAgentDelta } from './codex-events';

function helpIncludes(binPath: string, flag: string): boolean {
  const result = spawnSync(binPath, ['exec', '--help'], {
    encoding: 'utf8',
    timeout: 8_000,
    env: process.env,
    shell: false,
  });
  const text = `${result.stdout || ''}\n${result.stderr || ''}`;
  return text.includes(flag);
}

function needsDangerFullAccess(
  platform: NodeJS.Platform = process.platform,
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  if (platform === 'win32') return true;
  return Boolean(env.WSL_DISTRO_NAME?.trim());
}

export function buildCodexExecArgs(input: {
  resumeThreadId?: string;
  skipGitRepoCheck: boolean;
  platform?: NodeJS.Platform;
  env?: NodeJS.ProcessEnv;
}): string[] {
  const resume = Boolean(input.resumeThreadId);
  const danger = needsDangerFullAccess(input.platform, input.env);
  const sandboxArgs = danger
    ? resume
      ? ['-c', 'sandbox_mode="danger-full-access"']
      : ['--sandbox', 'danger-full-access']
    : resume
      ? ['-c', 'sandbox_mode="workspace-write"', '-c', 'sandbox_workspace_write.network_access=true']
      : ['--sandbox', 'workspace-write', '-c', 'sandbox_workspace_write.network_access=true'];

  const skipGit = input.skipGitRepoCheck ? ['--skip-git-repo-check'] : [];
  const approvalArgs = ['-c', 'approval_policy="never"'];
  const args = resume
    ? ['exec', 'resume', '--json', ...skipGit, ...sandboxArgs, ...approvalArgs]
    : ['exec', '--json', ...skipGit, ...sandboxArgs, ...approvalArgs];

  if (input.resumeThreadId) {
    args.push(input.resumeThreadId);
  }
  return args;
}

export async function spawnCodex(input: RuntimeSpawnInput): Promise<RuntimeSpawnResult> {
  return traceExternal(
    {
      kind: 'spawn',
      streamId: input.streamId,
      summary: `${path.basename(input.binPath)} exec`,
      detail: { bin: path.basename(input.binPath), resume: Boolean(input.resumeThreadId) },
    },
    (span) => spawnCodexProcess(input, span.setDetail),
  );
}

async function spawnCodexProcess(
  input: RuntimeSpawnInput,
  setDetail: (detail: unknown) => void,
): Promise<RuntimeSpawnResult> {
  const { binPath, workspaceDir, mcpUrl, prompt, resumeThreadId, signal } = input;
  const codexHome = prepareCodexWorkspace(workspaceDir, mcpUrl);
  const args = buildCodexExecArgs({
    resumeThreadId,
    skipGitRepoCheck: helpIncludes(binPath, '--skip-git-repo-check'),
  });

  const child = spawn(binPath, args, {
    cwd: workspaceDir,
    env: {
      ...process.env,
      CODEX_HOME: codexHome,
    },
    shell: false,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  registerChildProcess(input.streamId, child);

  if (signal.aborted) {
    child.kill('SIGTERM');
  } else {
    signal.addEventListener('abort', () => {
      if (!child.killed) child.kill('SIGTERM');
    });
  }

  child.stdin?.write(prompt);
  child.stdin?.end();

  let threadId = resumeThreadId;
  let lastAgentText = '';
  const stderrChunks: string[] = [];
  child.stderr?.on('data', (chunk) => {
    stderrChunks.push(String(chunk));
  });

  const exitPromise = new Promise<number | null>((resolve) => {
    child.once('exit', (code) => resolve(code));
    child.once('error', () => resolve(1));
  });

  if (child.stdout) {
    await consumeJsonl(child.stdout, (event) => {
      const type = readString(event.type);
      if (type === 'thread.started') {
        const nextId = readString(event.thread_id) || readString(event.threadId);
        if (nextId) {
          threadId = nextId;
          input.onThreadId(nextId);
        }
        return;
      }
      const parsed = extractCodexAgentDelta(event, lastAgentText);
      lastAgentText = parsed.nextLastAgentText;
      if (parsed.delta) input.onDelta(parsed.delta);
    });
  }

  const exitCode = await exitPromise;
  const stderr = stderrChunks.join('');
  setDetail({
    bin: path.basename(binPath),
    exitCode,
    stderr: stderr.trim().slice(0, 800),
  });

  return {
    threadId,
    exitCode,
    stderr,
  };
}

