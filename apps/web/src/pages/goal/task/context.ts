import { createInjectState } from '@/utils/createInjectState';

export const [TaskProvider, useTaskContext] = createInjectState<{
  ContextType: Record<string, unknown>;
}>((props) => {
  return {};
});
