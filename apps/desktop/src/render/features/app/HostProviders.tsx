import type { ReactNode } from 'react';
import { getRendererRuntimeOptional } from '@true-north/plugin-sdk';
import { AiSessionProvider } from '@/features/ai/context';
import { createAiWorkspaceHost } from '@/features/ai/workspace-host';
import { WorkbenchProvider } from '@/features/workbench';

export function HostProviders({ children }: { children: ReactNode }) {
  const runtime = getRendererRuntimeOptional();
  const extract = runtime?.workbenchActions.find((action) => action.id.endsWith('.extract'));
  const pluginProviders = [...(runtime?.shellSlots || [])]
    .filter((slot) => slot.slot === 'app-providers')
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  const overlays = [...(runtime?.shellSlots || [])]
    .filter((slot) => slot.slot === 'page-overlay')
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  let tree: ReactNode = (
    <>
      {overlays.map((slot) => {
        const Slot = slot.render;
        return <Slot key={`${slot.pluginId}:${slot.id}`} />;
      })}
      {children}
    </>
  );
  for (const slot of [...pluginProviders].reverse()) {
    const Slot = slot.render;
    tree = <Slot>{tree}</Slot>;
  }

  return (
    <WorkbenchProvider
      tools={(runtime?.workbenchTools || []) as never}
      workspaceHost={runtime?.workspaceHost || createAiWorkspaceHost()}
      extractHandler={
        extract
          ? async (input) => {
              await extract.run(input as never);
            }
          : undefined
      }
    >
      <AiSessionProvider entitySources={runtime?.createEntitySources || (() => [])}>{tree}</AiSessionProvider>
    </WorkbenchProvider>
  );
}
