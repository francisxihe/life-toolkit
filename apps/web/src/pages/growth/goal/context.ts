import { createInjectState } from '@/utils/createInjectState';

export const [GoalProvider, useGoalContext] = createInjectState<{
  ContextType: Record<string, unknown>;
}>((props) => {
  return {};
});
