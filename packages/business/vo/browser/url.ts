const BLOCKED_PROTOCOLS = new Set(['javascript:', 'file:', 'data:', 'blob:', 'about:', 'chrome:', 'devtools:']);

function looksLikeHost(value: string): boolean {
  if (!value || /\s/.test(value) || value.includes('://')) return false;
  if (value === 'localhost' || value.startsWith('localhost:')) return true;
  return value.includes('.');
}

export function isAllowedBrowserUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/** Trim, require http(s), prepend https:// for host-like input. Returns null when invalid. */
export function normalizeBrowserUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const lower = trimmed.toLowerCase();
  for (const protocol of BLOCKED_PROTOCOLS) {
    if (lower.startsWith(protocol)) return null;
  }

  const withScheme = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : looksLikeHost(trimmed)
      ? `${trimmed === 'localhost' || trimmed.startsWith('localhost:') ? 'http' : 'https'}://${trimmed}`
      : null;
  if (!withScheme) return null;

  try {
    const parsed = new URL(withScheme);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    return parsed.toString();
  } catch {
    return null;
  }
}
