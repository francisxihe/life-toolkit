import dayjs from 'dayjs';
import type { PluginMainContribution, PluginMainContext, TodayContribution } from '@true-north/plugin-sdk';
import { ExpenseController } from './service/expense.route-controller';
import { expenseCaptureAdopter } from './service/capture.adopter';
import { expenseService } from './service/expense.service';
import { bindActivityPort } from './ports';
import { activateStorage, disposeStorage } from './storage';
import { expenseQuery } from './query';

const today: TodayContribution = {
  pluginId: 'expense',
  async collect() {
    const todayDate = dayjs().format('YYYY-MM-DD');
    const transactions = await expenseService.listTransactions();
    const spent = transactions
      .filter((item) => item.type === 'expense' && dayjs(item.transactionDateTime).format('YYYY-MM-DD') === todayDate)
      .reduce((sum, item) => sum + item.amount, 0);
    return { spent };
  },
};

export function createExpenseMain(): PluginMainContribution {
  return {
    ipcControllers: [{ id: 'expense', routePrefix: '/expense', controller: ExpenseController }],
    query: expenseQuery,
    captureAdopters: [expenseCaptureAdopter],
    today,
    async activate(ctx: PluginMainContext) {
      await activateStorage(ctx.space);
      bindActivityPort(ctx.activity);
    },
    async dispose() {
      await disposeStorage();
    },
  };
}
