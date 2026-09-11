import { activityRefFromLegacyDomain } from '@true-north/plugin-sdk';
import type { ActivityPort, CreateActivityInput } from '@true-north/plugin-sdk';

let activityPort: ActivityPort | null = null;

export function bindActivityPort(port: ActivityPort) {
  activityPort = port;
}

function port(): ActivityPort {
  if (!activityPort) throw new Error('Activity port is not bound');
  return activityPort;
}

export async function recordDomainActivity(input: {
  title: string;
  summary?: string;
  source?: string;
  links: Array<{ domain: string; entityId: string; role?: string; label?: string }>;
}) {
  const mapped: CreateActivityInput = {
    title: input.title,
    summary: input.summary,
    source: input.source || 'domain',
    links: input.links.map((link) => ({
      ...activityRefFromLegacyDomain(link.domain, link.entityId),
      role: link.role,
      label: link.label,
    })),
  };
  try {
    await port().record(mapped);
  } catch {
    // activity card is supplementary
  }
}

export async function unlinkDomain(domain: string, entityId: string) {
  try {
    await port().unlink(activityRefFromLegacyDomain(domain, entityId));
  } catch {
    // activity card is supplementary
  }
}
