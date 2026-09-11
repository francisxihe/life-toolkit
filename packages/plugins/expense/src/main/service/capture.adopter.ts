import type { CaptureAdopter } from '@true-north/plugin-sdk';
import { expenseService } from './expense.service';

export const expenseCaptureAdopter: CaptureAdopter = {
  type: 'expense.transaction',
  async adopt(suggestion) {
    const payload = suggestion.payload || {};
    const transaction = await expenseService.createTransaction(
      {
        type: (payload.transactionType as 'income' | 'expense') || 'expense',
        amount: Number(payload.amount || 0),
        description: String(payload.title || ''),
        category: String(payload.category || 'dining'),
        tags: Array.isArray(payload.tags) ? (payload.tags as string[]) : [],
        transactionDateTime: payload.occurredAt ? String(payload.occurredAt) : new Date().toISOString(),
      },
      { skipActivity: true },
    );
    return {
      pluginId: 'expense',
      entityType: 'transaction',
      entityId: transaction.id,
      role: 'expense',
      label: transaction.description,
    };
  },
};
