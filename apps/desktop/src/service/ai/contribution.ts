import type { AiCapability } from './capability/capability.registry';
import { capabilityRegistry } from './capability/capability.registry';
import type { AgentTool } from './agent/tools';
import { agentToolRegistry } from './agent/tools';
import type { EntityResolver } from './entity/entity-resolver.registry';
import { entityResolverRegistry } from './entity/entity-resolver.registry';
import { addAgentInstructions } from './runtime/agent-instructions';

export type AiDomainContribution = {
  capabilities?: AiCapability[];
  tools?: AgentTool[];
  entityResolvers?: EntityResolver[];
  agentInstructions?: string;
};

export function registerAiContribution(contribution: AiDomainContribution) {
  for (const capability of contribution.capabilities || []) {
    capabilityRegistry.register(capability);
  }
  if (contribution.tools?.length) {
    agentToolRegistry.register(contribution.tools);
  }
  for (const resolver of contribution.entityResolvers || []) {
    entityResolverRegistry.register(resolver);
  }
  if (contribution.agentInstructions?.trim()) {
    addAgentInstructions(contribution.agentInstructions.trim());
  }
}
