import type { ComponentType, ReactNode } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import type {
  ActivityPort,
  CaptureAdopter,
  PluginManifest,
  PluginQueryPort,
  PluginSpace,
  ShellSlotId,
  TodaySectionSnapshot,
} from '@true-north/plugin-contract';

export type AiCapability<I = unknown, O = unknown> = {
  key: string;
  execute(input: I): Promise<O>;
};

export type AiCachePort = {
  fingerprintPromptContext(promptContext: string): string;
  findMatching<T extends { runId: string; analysisSummary: string; suggestions: unknown[] }>(input: {
    capabilityKey: string;
    refType: string;
    refId: string;
    contextFingerprint: string;
  }): Promise<T | null>;
  upsert(input: {
    capabilityKey: string;
    refType: string;
    refId: string;
    contextFingerprint: string;
    response: { runId: string; analysisSummary: string; suggestions: unknown[] };
  }): Promise<void>;
};

export type AgentTool = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  schema: { parse(value: unknown): unknown };
  readOnly?: boolean;
  execute: (args: Record<string, unknown>, ctx: { appendWorkspace: (part: unknown) => void }) => Promise<string>;
};

export type EntityResolver = {
  type: string;
  resolve(id: string): Promise<{ type: string; id: string; name: string; label?: string } | null>;
};

export type AiContribution = {
  capabilities?: AiCapability[];
  tools?: AgentTool[];
  entityResolvers?: EntityResolver[];
  agentInstructions?: string;
};

export type WorkbenchHostActions = {
  updatePayload: (payload: Record<string, unknown>) => Promise<boolean>;
  requestFollowUp: (text: string) => void;
};

export type WorkbenchToolProps<TPayload = Record<string, unknown>> = {
  payload: TPayload;
  messageId: string;
  conversationId: string;
  actions: WorkbenchHostActions;
};

export type WorkbenchToolDefinition<TPayload = Record<string, unknown>> = {
  workspaceKey: string;
  title: (payload: TPayload) => string;
  entryLabel: (payload: TPayload) => string;
  autoOpen?: (input: { payload: TPayload; message: { parts: Array<Record<string, unknown>> } | unknown; force: boolean }) => boolean;
  parsePayload: (payload: Record<string, unknown>) => TPayload;
  Component: ComponentType<WorkbenchToolProps<TPayload>>;
};

export type WorkbenchActionContribution = {
  id: string;
  run: (input: Record<string, unknown>) => Promise<void>;
};

export const WORKBENCH_EXTRACT_ACTION = 'workbench.extract';

export type WorkbenchExtractHandler = (input: {
  result: unknown;
  url: string;
}) => Promise<void>;

export type WorkbenchWorkspaceHost = {
  load(conversationId: string, messageId: string): Promise<{ workspaceKey: string; payload: Record<string, unknown> }>;
  subscribe(
    messageId: string,
    onUpdate: (next: { workspaceKey: string; payload: Record<string, unknown> }) => void,
  ): () => void;
  patch(messageId: string, payload: Record<string, unknown>): Promise<Record<string, unknown>>;
};

export type AiEntityRecord = {
  type: string;
  id: string;
  label: string;
};

export type AiEntitySource = {
  type: string;
  kindLabel: string;
  boundKindLabel: string;
  searchParam: string;
  list(): Promise<AiEntityRecord[]>;
  find(id: string): Promise<AiEntityRecord | null>;
  open(id: string): void;
};

export type PluginIcon = ComponentType<{
  size?: number | string;
  className?: string;
  strokeWidth?: number | string;
}>;

export type LocaleContribution = {
  pluginId: string;
  messages: Record<string, Record<string, string>>;
};

export type EntityPresenter = {
  pluginId: string;
  entityType: string;
  kindLabel: string;
  openPath(entityId: string): string;
};

export type TodaySectionContribution = {
  id: string;
  collect(): Promise<TodaySectionSnapshot>;
};

export type PluginIpcPort = {
  get<T = unknown>(path: string, payload?: unknown): Promise<T>;
  post<T = unknown>(path: string, payload?: unknown): Promise<T>;
  put<T = unknown>(path: string, payload?: unknown): Promise<T>;
  remove<T = unknown>(path: string, payload?: unknown): Promise<T>;
};

export type HostActionPort = {
  invoke(id: string, input?: unknown): Promise<void> | void;
  register(id: string, handler: (input?: unknown) => void | Promise<void>): () => void;
};

export class HostActionRegistry implements HostActionPort {
  private readonly handlers = new Map<string, (input?: unknown) => void | Promise<void>>();

  register(id: string, handler: (input?: unknown) => void | Promise<void>) {
    this.handlers.set(id, handler);
    return () => {
      if (this.handlers.get(id) === handler) this.handlers.delete(id);
    };
  }

  async invoke(id: string, input?: unknown) {
    const handler = this.handlers.get(id);
    if (!handler) throw new Error(`Unknown host action: ${id}`);
    await handler(input);
  }
}

export type PluginMainContext = {
  pluginId: string;
  space: PluginSpace;
  activity: ActivityPort;
  ai: {
    getCapability<I = unknown, O = unknown>(key: string): AiCapability<I, O>;
    cache: AiCachePort;
  };
};

export type PluginMainHandles = {
  ipcControllers?: Record<string, { controller: object }>;
  ai?: AiContribution;
  query?: PluginQueryPort;
  captureAdopters?: CaptureAdopter[];
  todaySections?: TodaySectionContribution[];
};

export type PluginMainModule = {
  activate(ctx: PluginMainContext): Promise<PluginMainHandles> | PluginMainHandles;
  dispose?(): void | Promise<void>;
};

export type PluginRendererContext = {
  pluginId: string;
  locale: { lang: string; t: (key: string) => string };
  ipc: PluginIpcPort;
  navigate: NavigateFunction;
  hostActions: HostActionPort;
  product?: {
    Surface: ComponentType<{ id: string; children?: ReactNode }>;
    ref: (id: string) => string;
  };
};

export type ShellSlotContribution = {
  slot: ShellSlotId;
  pluginId: string;
  id: string;
  order?: number;
  render: ComponentType<{ children?: ReactNode }>;
};

export type PluginRuntimeEntry = {
  pluginId: string;
  nameKey: string;
  path: string;
  order?: number;
  icon?: PluginIcon;
  descriptionKey?: string;
  categoryKey?: string;
  keywords?: string[];
  load: () => Promise<{ default: ComponentType }>;
};

export type PluginRendererHandles = {
  icon?: PluginIcon;
  load: () => Promise<{ default: ComponentType }>;
  workbenchTools?: WorkbenchToolDefinition[];
  workbenchActions?: WorkbenchActionContribution[];
  entitySources?: (navigate: NavigateFunction) => AiEntitySource[];
  entityPresenters?: EntityPresenter[];
  shellSlots?: ShellSlotContribution[];
  locales?: LocaleContribution[];
  actions?: Record<string, (input?: unknown) => void>;
};

export type PluginRendererModule = {
  activate(ctx: PluginRendererContext): PluginRendererHandles;
};

export type PluginDescriptor = {
  manifest: PluginManifest;
  loadMain?: () => Promise<{ createMain: () => PluginMainModule | Promise<PluginMainModule> } | PluginMainModule>;
  loadRenderer?: () => Promise<
    { createRenderer: () => PluginRendererModule } | PluginRendererModule
  >;
};
