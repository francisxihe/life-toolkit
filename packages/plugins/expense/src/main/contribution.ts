import dayjs from 'dayjs';
import { defineMainImplementation, namespacedId, type PluginMainContext } from '@true-north/plugin-sdk';
import { expenseManifest } from '../plugin';
import { ExpenseController } from './service/expense.route-controller';
import { expenseCaptureAdopter } from './service/capture.adopter';
import { expenseService } from './service/expense.service';
import { bindExpenseContext } from './context';
import { activateStorage, disposeStorage } from './storage';
import { createExpenseQuery } from './query';

export function createExpenseMain() {
  return defineMainImplementation(expenseManifest, {
    async activate(ctx: PluginMainContext) {
      const runtime = await activateStorage(ctx.space);
      bindExpenseContext(ctx.activity);
      return {
        ipcControllers: { expense: { controller: new ExpenseController() } },
        query: createExpenseQuery(runtime),
        captureAdopters: [expenseCaptureAdopter],
        todaySections: [
          {
            id: namespacedId('expense', 'spent'),
            async collect() {
              const todayDate = dayjs().format('YYYY-MM-DD');
              const transactions = await expenseService.listTransactions();
              const spent = transactions
                .filter(
                  (item) => item.type === 'expense' && dayjs(item.transactionDateTime).format('YYYY-MM-DD') === todayDate,
                )
                .reduce((sum, item) => sum + item.amount, 0);
              return {
                id: namespacedId('expense', 'spent'),
                kind: 'metric' as const,
                titleKey: 'plugins.hub.spent',
                order: 10,
                value: spent,
              };
            },
          },
        ],
      };
    },
    async dispose() {
      await disposeStorage();
    },
  });
}
