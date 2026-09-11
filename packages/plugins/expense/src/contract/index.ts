import { pluginPath } from '@true-north/plugin-sdk';

export const EXPENSE_PLUGIN_ID = 'expense';

export const expensePaths = {
  root: pluginPath(EXPENSE_PLUGIN_ID),
} as const;

export type ExpenseView = 'transaction' | 'budget' | 'overview';

export function expenseHref(view?: ExpenseView): string {
  if (!view) return expensePaths.root;
  return `${expensePaths.root}?view=${view}`;
}
