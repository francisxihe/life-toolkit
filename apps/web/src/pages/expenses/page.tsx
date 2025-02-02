'use client';

import { Tabs } from '@arco-design/web-react';
import { TransactionList } from './components/transaction-list';
import { TransactionForm } from './components/transaction-form';
import { TransactionStats } from './components/transaction-stats';
import { TransactionFilters } from './components/transaction-filters';
import { BudgetOverview } from './components/budget-overview';
import ExpensesLayout from './layout';

const TabPane = Tabs.TabPane;

export default function ExpensesPage() {
  return (
    <ExpensesLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Finance Manager</h1>
        </div>

        <Tabs defaultActiveTab="overview">
          <TabPane key="overview" title="Overview">
            <div className="space-y-6 mt-4">
              <TransactionStats />
              <BudgetOverview />
              <TransactionList limit={5} />
            </div>
          </TabPane>

          <TabPane key="transactions" title="Transactions">
            <div className="space-y-6 mt-4">
              <TransactionFilters />
              <TransactionForm />
              <TransactionList />
            </div>
          </TabPane>

          <TabPane key="budgets" title="Budgets">
            <div className="space-y-6 mt-4">
              <BudgetOverview showForm />
            </div>
          </TabPane>
        </Tabs>
      </div>
    </ExpensesLayout>
  );
}
