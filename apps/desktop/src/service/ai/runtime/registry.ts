import type { RuntimeAgentDef } from './types';

export const RUNTIME_AGENT_DEFS: RuntimeAgentDef[] = [
  {
    id: 'codex',
    name: 'ChatGPT',
    binaries: ['codex'],
  },
];

export function getRuntimeAgentDef(id: string): RuntimeAgentDef | undefined {
  return RUNTIME_AGENT_DEFS.find((item) => item.id === id);
}
