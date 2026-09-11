import type { LocaleContribution } from '@true-north/plugin-sdk';

export const expenseLocales: LocaleContribution = {
  pluginId: 'expense',
  messages: {
    'zh-CN': {
      'menu.expense': '记账',
      'menu.expense.transaction': '账单',
      'menu.expense.budget': '预算',
      'menu.expense.overview': '总览',
      'expense.hub.description': '账单、预算与花费总览',
    },
    'en-US': {
      'menu.expense': 'Expenses',
      'menu.expense.transaction': 'Transactions',
      'menu.expense.budget': 'Budgets',
      'menu.expense.overview': 'Overview',
      'expense.hub.description': 'Transactions, budgets, and spend overview',
    },
  },
};
