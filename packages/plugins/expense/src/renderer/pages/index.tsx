'use client';

import { ExpensesProvider } from './context';
import { useSearchParams } from 'react-router-dom';
import type { ExpenseView } from '@true-north/plugin-expense/contract';
import { expenseHref } from '@true-north/plugin-expense/contract';
import { TabsPage } from '@true-north/plugin-ui';
import { useLocale } from '@true-north/plugin-sdk/renderer';
import Transactions from './transaction';
import Budgets from './budget';
import Overview from './overview';

const VIEWS: ExpenseView[] = ['transaction', 'budget', 'overview'];

function parseExpenseView(value: string | null): ExpenseView {
  return VIEWS.includes(value as ExpenseView) ? (value as ExpenseView) : 'transaction';
}

function ExpensesViews() {
  const t = useLocale();
  const [params] = useSearchParams();
  const view = parseExpenseView(params.get('view'));

  return (
    <TabsPage
      tabs={[
        {
          name: t['menu.expense.transaction'] || '账单',
          href: expenseHref('transaction'),
          active: view === 'transaction',
        },
        {
          name: t['menu.expense.budget'] || '预算',
          href: expenseHref('budget'),
          active: view === 'budget',
        },
        {
          name: t['menu.expense.overview'] || '总览',
          href: expenseHref('overview'),
          active: view === 'overview',
        },
      ]}
    >
      {view === 'budget' ? <Budgets /> : null}
      {view === 'overview' ? <Overview /> : null}
      {view === 'transaction' ? <Transactions /> : null}
    </TabsPage>
  );
}

export default function ExpensesPage() {
  return (
    <ExpensesProvider>
      <ExpensesViews />
    </ExpensesProvider>
  );
}
