import { createRepositoryQueryPort } from '@true-north/plugin-sdk/host';
import type { PluginQueryPort } from '@true-north/plugin-sdk';
import { ExpenseTransaction } from './service/transaction.entity';
import { ExpenseBudget } from './service/budget.entity';
import { PLUGIN_ID } from './storage';

export const expenseQuery: PluginQueryPort = createRepositoryQueryPort(PLUGIN_ID, [
  { entityType: 'transaction', entity: ExpenseTransaction, label: (row) => String(row.description || row.id) },
  { entityType: 'budget', entity: ExpenseBudget, label: (row) => String(row.category || row.id) },
]);
