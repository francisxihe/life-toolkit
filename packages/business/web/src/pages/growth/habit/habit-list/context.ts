import { createInjectState } from '@/utils/createInjectState';

export const [HabitListProvider, _useHabitListContext] = createInjectState<{
  ContextType: Record<string, unknown>;
}>((props) => {
  return {};
});

export const useHabitListContext = () => {
  const context = _useHabitListContext();
  if (!context) {
    throw new Error(
      'useHabitListContext must be used within a HabitListProvider',
    );
  }
  return context;
};
