import { createContext, useContext, type ReactNode } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import type {
  AiEntitySource,
  EntityPresenter,
  HostActionPort,
  LocaleContribution,
  PluginIpcPort,
  PluginRendererContext,
  PluginRuntimeEntry,
  ShellSlotContribution,
  WorkbenchActionContribution,
  WorkbenchToolDefinition,
  WorkbenchWorkspaceHost,
} from '../runtime.ts';

export type RendererPlatformState = {
  lang: string;
  hostMessages?: Record<string, Record<string, string>>;
  plugins: PluginRuntimeEntry[];
  shellSlots: ShellSlotContribution[];
  workbenchTools: WorkbenchToolDefinition[];
  workbenchActions: WorkbenchActionContribution[];
  locales: LocaleContribution[];
  entityPresenters: EntityPresenter[];
  createEntitySources: (navigate: NavigateFunction) => AiEntitySource[];
  ipc: PluginIpcPort;
  hostActions: HostActionPort;
  workspaceHost?: WorkbenchWorkspaceHost;
  error?: string;
};

export class RendererPlatform {
  constructor(public readonly state: RendererPlatformState) {}

  get plugins() {
    return this.state.plugins;
  }

  get shellSlots() {
    return this.state.shellSlots;
  }

  get workbenchTools() {
    return this.state.workbenchTools;
  }

  get workbenchActions() {
    return this.state.workbenchActions;
  }

  get locales() {
    return this.state.locales;
  }

  get entityPresenters() {
    return this.state.entityPresenters;
  }

  get ipc() {
    return this.state.ipc;
  }

  get hostActions() {
    return this.state.hostActions;
  }

  get error() {
    return this.state.error;
  }
}

const RendererPlatformContext = createContext<RendererPlatform | null>(null);
const PluginRuntimeContext = createContext<PluginRendererContext | null>(null);

export function RendererPlatformProvider({
  platform,
  children,
}: {
  platform: RendererPlatform;
  children: ReactNode;
}) {
  return <RendererPlatformContext.Provider value={platform}>{children}</RendererPlatformContext.Provider>;
}

export function PluginRuntimeProvider({
  value,
  children,
}: {
  value: PluginRendererContext;
  children: ReactNode;
}) {
  return <PluginRuntimeContext.Provider value={value}>{children}</PluginRuntimeContext.Provider>;
}

export function useRendererPlatform(): RendererPlatform {
  const platform = useContext(RendererPlatformContext);
  if (!platform) throw new Error('RendererPlatform is not available');
  return platform;
}

export function useRendererPlatformOptional(): RendererPlatform | null {
  return useContext(RendererPlatformContext);
}

export function usePluginRuntime(): PluginRendererContext {
  const ctx = useContext(PluginRuntimeContext);
  if (!ctx) throw new Error('Plugin runtime is not available');
  return ctx;
}

export function usePluginRuntimeOptional(): PluginRendererContext | null {
  return useContext(PluginRuntimeContext);
}

export function usePluginIpc(): PluginIpcPort {
  const plugin = usePluginRuntimeOptional();
  if (plugin) return plugin.ipc;
  return useRendererPlatform().ipc;
}

export function useHostActions(): HostActionPort {
  const plugin = usePluginRuntimeOptional();
  if (plugin) return plugin.hostActions;
  return useRendererPlatform().hostActions;
}

export function useLocale(override?: Record<string, Record<string, string>> | null): Record<string, string> {
  const platform = useRendererPlatformOptional();
  const plugin = usePluginRuntimeOptional();
  const lang = plugin?.locale.lang || platform?.state.lang || 'zh-CN';
  if (override) return override[lang] || {};
  const host = platform?.state.hostMessages?.[lang] || {};
  const pluginMessages = (platform?.locales || []).map((item) => item.messages[lang] || {});
  return Object.assign({}, ...pluginMessages, host);
}
