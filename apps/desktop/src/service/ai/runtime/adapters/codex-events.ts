const IGNORED_ITEM_TYPES = new Set(['reasoning', 'mcp_tool_call', 'command_execution']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

export type CodexAgentDelta = {
  delta?: string;
  nextLastAgentText: string;
};

function emitAppend(lastAgentText: string, delta: string): CodexAgentDelta {
  if (!delta) return { nextLastAgentText: lastAgentText };
  return { delta, nextLastAgentText: lastAgentText + delta };
}

function emitSnapshotSuffix(lastAgentText: string, text: string): CodexAgentDelta {
  if (text === lastAgentText) return { nextLastAgentText: lastAgentText };
  if (text.startsWith(lastAgentText)) {
    const delta = text.slice(lastAgentText.length);
    return delta ? { delta, nextLastAgentText: text } : { nextLastAgentText: text };
  }
  return { nextLastAgentText: lastAgentText };
}

export function extractDelta(
  event: Record<string, unknown>,
  lastAgentText: string
): CodexAgentDelta {
  const type = asString(event.type);
  const item = isRecord(event.item) ? event.item : undefined;
  const payload = isRecord(event.payload) ? event.payload : undefined;
  const itemType = item ? asString(item.type) : undefined;

  if (itemType && IGNORED_ITEM_TYPES.has(itemType)) {
    return { nextLastAgentText: lastAgentText };
  }

  if (type === 'item.updated' || type === 'item.completed') {
    if (itemType === 'agent_message') {
      const text = item ? asString(item.text) : undefined;
      if (text !== undefined) return emitSnapshotSuffix(lastAgentText, text);
    }
    return { nextLastAgentText: lastAgentText };
  }

  if (type === 'item.delta') {
    const topDelta = asString(event.delta);
    if (topDelta) return emitAppend(lastAgentText, topDelta);
  }

  const nestedDelta = (item ? asString(item.delta) : undefined) || (payload ? asString(payload.delta) : undefined);
  if (nestedDelta) return emitAppend(lastAgentText, nestedDelta);

  if (itemType === 'agent_message') {
    const text = item ? asString(item.text) : undefined;
    if (text !== undefined && text.startsWith(lastAgentText) && text.length > lastAgentText.length) {
      return { delta: text.slice(lastAgentText.length), nextLastAgentText: text };
    }
  }

  return { nextLastAgentText: lastAgentText };
}
