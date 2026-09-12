import { createRepositoryQueryPort, type HostStorageRuntime } from '@true-north/plugin-sdk/main';
import type { PluginQueryPort } from '@true-north/plugin-sdk';
import { ExpenseTransaction } from './service/transaction.entity';
import { ExpenseBudget } from './service/budget.entity';
import { PLUGIN_ID } from './storage';

export function createExpenseQuery(runtime: HostStorageRuntime): PluginQueryPort {
  return createRepositoryQueryPort(PLUGIN_ID, runtime, [
    { entityType: 'transaction', entity: ExpenseTransaction, label: (row) => String(row.description || row.id) },
    { entityType: 'budget', entity: ExpenseBudget, label: (row) => String(row.category || row.id) },
  ]);
}
