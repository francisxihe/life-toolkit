import { createContext, useContext, type ReactNode } from 'react';
import type { WikiRuntime } from '../../runtime';

const WikiRuntimeContext = createContext<WikiRuntime | null>(null);

export function WikiRuntimeProvider({
  runtime,
  children,
}: {
  runtime: WikiRuntime;
  children: ReactNode;
}) {
  return <WikiRuntimeContext.Provider value={runtime}>{children}</WikiRuntimeContext.Provider>;
}

export function useWikiRuntime(): WikiRuntime {
  const runtime = useContext(WikiRuntimeContext);
  if (!runtime) throw new Error('WikiRuntimeContext is required');
  return runtime;
}
