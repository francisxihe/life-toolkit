import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';
import type { RuntimeAgentDef, RuntimeProbeResult } from './types';
import { RUNTIME_AGENT_DEFS } from './registry';

const resolvedPathCache = new Map<string, string>();

function extraSearchDirs(): string[] {
  const home = os.homedir();
  const dirs = [
    '/usr/local/bin',
    '/opt/homebrew/bin',
    '/Applications/ChatGPT.app/Contents/Resources',
    path.join(home, 'Applications', 'ChatGPT.app', 'Contents', 'Resources'),
    path.join(home, '.local', 'bin'),
    path.join(home, '.npm-global', 'bin'),
    path.join(home, '.cursor', 'bin'),
    path.join(home, '.codex', 'bin'),
  ];
  if (process.platform === 'win32') {
    const localApp = process.env.LOCALAPPDATA;
    const roaming = process.env.APPDATA;
    if (localApp) {
      dirs.push(path.join(localApp, 'Programs', 'cursor'));
      dirs.push(path.join(localApp, 'cursor'));
    }
    if (roaming) {
      dirs.push(path.join(roaming, 'npm'));
      dirs.push(path.join(roaming, 'npm', 'bin'));
    }
    dirs.push(path.join(home, 'AppData', 'Roaming', 'npm'));
    dirs.push('C:\\Program Files\\nodejs');
    dirs.push('C:\\Program Files\\Git\\usr\\bin');
  }
  return dirs;
}

function pathDirs(): string[] {
  const fromEnv = (process.env.PATH || '')
    .split(path.delimiter)
    .map((item) => item.trim())
    .filter(Boolean);
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const dir of [...fromEnv, ...extraSearchDirs()]) {
    const normalized = path.resolve(dir);
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    ordered.push(normalized);
  }
  return ordered;
}

function candidateNames(bin: string): string[] {
  if (process.platform !== 'win32') return [bin];
  if (path.extname(bin)) return [bin];
  return [`${bin}.exe`, `${bin}.cmd`, bin];
}

function isRunnable(file: string): boolean {
  try {
    const stat = fs.statSync(file);
    if (!stat.isFile()) return false;
    fs.accessSync(file, fs.constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

export function resolveBinary(binaries: string[]): string | undefined {
  const cacheKey = binaries.join('|');
  const cached = resolvedPathCache.get(cacheKey);
  if (cached && isRunnable(cached)) return cached;

  for (const dir of pathDirs()) {
    for (const bin of binaries) {
      for (const name of candidateNames(bin)) {
        const candidate = path.join(dir, name);
        if (isRunnable(candidate)) {
          resolvedPathCache.set(cacheKey, candidate);
          return candidate;
        }
      }
    }
  }
  return undefined;
}

function runCli(binPath: string, args: string[]): { status: number | null; stdout: string; stderr: string } {
  const result = spawnSync(binPath, args, {
    encoding: 'utf8',
    timeout: 12_000,
    env: process.env,
    shell: false,
  });
  return {
    status: result.status,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
  };
}

function probeCodexAuth(binPath: string): boolean {
  const result = runCli(binPath, ['login', 'status']);
  return result.status === 0;
}

export function probeAgent(def: RuntimeAgentDef): RuntimeProbeResult {
  const resolvedPath = resolveBinary(def.binaries);
  if (!resolvedPath) {
    return {
      id: def.id,
      name: def.name,
      available: false,
      authenticated: false,
      unavailableReason: '未安装 ChatGPT',
    };
  }

  const authenticated = probeCodexAuth(resolvedPath);
  if (!authenticated) {
    return {
      id: def.id,
      name: def.name,
      available: false,
      authenticated: false,
      resolvedPath,
      unavailableReason: '未登录',
    };
  }

  return {
    id: def.id,
    name: def.name,
    available: true,
    authenticated: true,
    resolvedPath,
  };
}

export function probeAllAgents(): RuntimeProbeResult[] {
  return RUNTIME_AGENT_DEFS.map(probeAgent);
}

export function toRuntimeAgentVo(result: RuntimeProbeResult) {
  const { resolvedPath: _resolvedPath, ...vo } = result;
  return vo;
}
