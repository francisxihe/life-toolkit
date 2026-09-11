import type { NavigateFunction } from 'react-router-dom';
import type {
  AiEntitySource,
  PluginRuntimeEntry,
  ShellSlotContribution,
  WorkbenchActionContribution,
  WorkbenchToolDefinition,
  WorkbenchWorkspaceHost,
  LocaleContribution,
  EntityPresenter,
} from './contributions.ts';

export type PluginRendererRuntime = {
  plugins: PluginRuntimeEntry[];
  shellSlots: ShellSlotContribution[];
  workbenchTools: WorkbenchToolDefinition[];
  workbenchActions: WorkbenchActionContribution[];
  workspaceHost?: WorkbenchWorkspaceHost;
  locales: LocaleContribution[];
  entityPresenters: EntityPresenter[];
  createEntitySources: (navigate: NavigateFunction) => AiEntitySource[];
};

let runtime: PluginRendererRuntime | null = null;

export function bindRendererRuntime(next: PluginRendererRuntime) {
  runtime = next;
}

export function getRendererRuntime(): PluginRendererRuntime {
  if (!runtime) {
    throw new Error('Plugin renderer runtime is not bound');
  }
  return runtime;
}

export function getRendererRuntimeOptional(): PluginRendererRuntime | null {
  return runtime;
}
