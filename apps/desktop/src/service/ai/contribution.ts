import { attachAgentToolRegistry, type AgentTool } from './agent/tools';
import { attachEntityResolverRegistry, type EntityResolver } from './entity/entity-resolver.registry';
import { addAgentInstructions } from './runtime/agent-instructions';
import type { AiCapability } from './capability/capability.registry';
import type { CapabilityRegistry } from './capability/capability.registry';
import type { AgentToolRegistry } from './agent/tools';
import type { EntityResolverRegistry } from './entity/entity-resolver.registry';

export type AiDomainContribution = {
  capabilities?: AiCapability[];
  tools?: AgentTool[];
  entityResolvers?: EntityResolver[];
  agentInstructions?: string;
};

export function registerAiContribution(
  registries: {
    capabilities: CapabilityRegistry;
    agentTools: AgentToolRegistry;
    entityResolvers: EntityResolverRegistry;
  },
  contribution: AiDomainContribution,
) {
  for (const capability of contribution.capabilities || []) {
    registries.capabilities.register(capability);
  }
  if (contribution.tools?.length) {
    registries.agentTools.register(contribution.tools);
  }
  for (const resolver of contribution.entityResolvers || []) {
    registries.entityResolvers.register(resolver);
  }
  if (contribution.agentInstructions?.trim()) {
    addAgentInstructions(contribution.agentInstructions.trim());
  }
}

export function attachAiRegistries(registries: {
  agentTools: AgentToolRegistry;
  entityResolvers: EntityResolverRegistry;
}) {
  attachAgentToolRegistry(registries.agentTools);
  attachEntityResolverRegistry(registries.entityResolvers);
}
