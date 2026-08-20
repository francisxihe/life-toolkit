import readline from 'readline';
import type { Readable } from 'stream';

export function consumeJsonl(
  stream: Readable,
  onObject: (value: Record<string, unknown>) => void
): Promise<void> {
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
  rl.on('line', (line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        onObject(parsed as Record<string, unknown>);
      }
    } catch {
      // CLI may print non-JSON banners on stdout; ignore
    }
  });
  return new Promise((resolve, reject) => {
    rl.on('close', resolve);
    rl.on('error', reject);
    stream.on('error', reject);
  });
}

export function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

export function collectTextBlocks(value: unknown): string {
  if (typeof value === 'string') return value;
  if (!Array.isArray(value)) return '';
  const texts: string[] = [];
  for (const item of value) {
    if (typeof item === 'string') {
      texts.push(item);
      continue;
    }
    if (item && typeof item === 'object' && 'text' in item && typeof (item as { text: unknown }).text === 'string') {
      texts.push((item as { text: string }).text);
    }
  }
  return texts.join('');
}
