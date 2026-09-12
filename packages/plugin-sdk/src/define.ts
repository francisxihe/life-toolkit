import type { PluginManifest } from '@true-north/plugin-contract';
import type {
  PluginMainContext,
  PluginMainHandles,
  PluginMainModule,
  PluginRendererContext,
  PluginRendererHandles,
  PluginRendererModule,
} from './runtime.ts';

type RecordKeys<T> = T extends Record<string, unknown> ? keyof T & string : never;

export type TypedMainHandles<M extends PluginManifest> = Omit<PluginMainHandles, 'ipcControllers'> & {
  ipcControllers?: [RecordKeys<NonNullable<M['contributions']['ipc']>>] extends [never]
    ? PluginMainHandles['ipcControllers']
    : Record<RecordKeys<NonNullable<M['contributions']['ipc']>>, { controller: object }>;
};

export function defineMainImplementation<const M extends PluginManifest>(
  _manifest: M,
  module: {
    activate(ctx: PluginMainContext): Promise<TypedMainHandles<M>> | TypedMainHandles<M>;
    dispose?(): void | Promise<void>;
  },
): PluginMainModule {
  return module as PluginMainModule;
}

export function defineRendererImplementation<const M extends PluginManifest>(
  _manifest: M,
  module: {
    activate(ctx: PluginRendererContext): PluginRendererHandles;
  },
): PluginRendererModule {
  return module;
}
