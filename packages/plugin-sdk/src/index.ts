export {
  PLUGIN_API_VERSION,
  REQUIRED_PLUGIN_IDS,
  FIRST_PARTY_PLUGIN_IDS,
  PLUGIN_HUB_PATH,
  isRequiredPluginId,
  namespacedId,
  pluginPath,
} from './ids.ts';
export type { PluginApiVersion, RequiredPluginId, FirstPartyPluginId } from './ids.ts';

export {
  pluginManifestSchema,
  parsePluginManifest,
  ipcContributionDescriptorSchema,
} from './manifest.ts';
export type { PluginManifest, IpcContributionDescriptor } from './manifest.ts';

export { hostStorageCapabilitySchema } from './storage-protocol.ts';
export type {
  HostStorageCapability,
  StorageContributionDescriptor,
  PluginStorageHandle,
  PluginMigrationDescriptor,
  PluginSpace,
  PluginRecord,
  PluginQueryPort,
} from './storage-protocol.ts';

export {
  captureSuggestionSchema,
  capturePayloadSchema,
  adoptCaptureRequestSchema,
  normalizeCaptureSuggestion,
  captureTypeFromLegacyKind,
  legacyKindFromCaptureType,
} from './capture.ts';
export type { CaptureSuggestion, CapturePayload, AdoptCaptureRequest, CaptureAdopter, CaptureAdoptedLink, CaptureSuggestionStatus } from './capture.ts';

export {
  activityEntityRefSchema,
  activityRefFromLegacyDomain,
  legacyDomainFromActivityRef,
  mergeTodaySnapshots,
  ACTIVITY_RECORD_EVENT,
  ACTIVITY_UNLINK_EVENT,
} from './activity.ts';
export type {
  ActivityEntityRef,
  ActivityLinkRef,
  CreateActivityInput,
  ActivityPort,
  EntityPresenter,
  TodayContribution,
  TodaySnapshot,
} from './activity.ts';

export type {
  IpcControllerContribution,
  AiCapability,
  AgentTool,
  EntityResolver,
  AiContribution,
  WorkbenchToolDefinition,
  WorkbenchToolProps,
  WorkbenchHostActions,
  WorkbenchActionContribution,
  WorkbenchExtractHandler,
  WorkbenchWorkspaceHost,
  AiEntityRecord,
  AiEntitySource,
  ShellSlotId,
  ShellSlotContribution,
  PluginIcon,
  PluginRuntimeEntry,
  LocaleContribution,
  PluginMainContext,
  PluginMainContribution,
  PluginRendererContribution,
  PluginModuleLoader,
} from './contributions.ts';
export { WORKBENCH_EXTRACT_ACTION } from './contributions.ts';

export {
  AiPlatformError,
  parseAiError,
  toIpcError,
  bindAiCapabilityLookup,
  getAiCapability,
  bindAiCache,
  fingerprintPromptContext,
  cacheService,
} from './ai-protocol.ts';

export { bindRendererRuntime, getRendererRuntime, getRendererRuntimeOptional } from './renderer-runtime.ts';
export type { PluginRendererRuntime } from './renderer-runtime.ts';

export { registerFocusOpener, requestOpenFocus, registerWorkbenchOpener, requestOpenWorkbench } from './host-actions.ts';

export { assemblePluginCatalog, validateManifests, activationOrder, disposeOrder } from './catalog.ts';
export type { CatalogIssue, PluginCatalog, AssembledPlugin, AssembleCatalogOptions } from './catalog.ts';

export { useWorkbench, useWorkbenchOptional, WorkbenchRuntimeContext } from './workbench-runtime.ts';
export type { WorkbenchRuntimeValue, WorkbenchToolRegistry } from './workbench-runtime.ts';

export type { AiContribution as AiDomainContribution } from './contributions.ts';

