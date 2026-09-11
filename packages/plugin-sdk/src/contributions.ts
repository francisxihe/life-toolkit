import type { ComponentType, ReactNode } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import type { CaptureAdopter } from './capture.ts';
import type { ActivityPort, EntityPresenter, TodayContribution } from './activity.ts';
import type { PluginQueryPort, PluginSpace } from './storage-protocol.ts';

export type { EntityPresenter };

export type IpcControllerContribution = {
  id: string;
  routePrefix: string;
  controller: unknown;
};

export type AiCapability<I = unknown, O = unknown> = {
  key: string;
  execute(input: I): Promise<O>;
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
  result: import('@true-north/vo').BrowserExtractResultVo;
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

export type ShellSlotId =
  | 'app-providers'
  | 'aside-sessions'
  | 'aside-actions'
  | 'page-overlay'
  | 'sidebar-primary'
  | 'stage-aside';

export type ShellSlotContribution = {
  slot: ShellSlotId;
  pluginId: string;
  id: string;
  order?: number;
  render: ComponentType<{ children?: ReactNode }>;
};

export type PluginIcon = ComponentType<{
  size?: number | string;
  className?: string;
  strokeWidth?: number | string;
}>;

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

export type LocaleContribution = {
  pluginId: string;
  messages: Record<string, Record<string, string>>;
};

export type PluginMainContext = {
  pluginId: string;
  space: PluginSpace;
  activity: ActivityPort;
  getCapability<I = unknown, O = unknown>(key: string): AiCapability<I, O>;
};

export type PluginMainContribution = {
  ipcControllers?: IpcControllerContribution[];
  ai?: AiContribution;
  query?: PluginQueryPort;
  captureAdopters?: CaptureAdopter[];
  today?: TodayContribution;
  entityPresenters?: EntityPresenter[];
  activate?(ctx: PluginMainContext): void | Promise<void>;
  dispose?(): void | Promise<void>;
};

export type PluginRendererContribution = {
  nameKey: string;
  icon?: PluginIcon;
  descriptionKey?: string;
  categoryKey?: string;
  keywords?: string[];
  order?: number;
  load: () => Promise<{ default: ComponentType }>;
  workbenchTools?: WorkbenchToolDefinition[];
  workbenchActions?: WorkbenchActionContribution[];
  workspaceHost?: WorkbenchWorkspaceHost;
  entitySources?: (navigate: NavigateFunction) => AiEntitySource[];
  entityPresenters?: EntityPresenter[];
  shellSlots?: ShellSlotContribution[];
  locales?: LocaleContribution[];
};

export type PluginModuleLoader = {
  manifest: import('./manifest').PluginManifest;
  loadMain?: () => Promise<
    | { createMain: () => PluginMainContribution | Promise<PluginMainContribution> }
    | PluginMainContribution
  >;
  loadRenderer?: () => Promise<{ createRenderer: () => PluginRendererContribution } | PluginRendererContribution>;
};
