import { Card, Progress, Button } from '@arco-design/web-react';
import { useExpenses } from '../context';
import { DEFAULT_CATEGORIES } from '../constants';
import { useCreateBudget } from '../budget/CreateBudget';

export function BudgetOverview() {
  const { budgetList, addBudget } = useExpenses();
  const { openCreateModal } = useCreateBudget({
    onConfirm: (values) => {
      addBudget(values);
    },
  });

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {budgetList.map((budget) => {
          const percentage = (budget.spent / budget.amount) * 100;
          const category = DEFAULT_CATEGORIES[budget.category];

          return (
            <Card key={budget.id}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">
                  {category?.name || budget.category}
                </span>
                <span className="text-sm text-gray-500">{budget.period}</span>
              </div>
              <div className="text-2xl font-bold mb-2">
                ${budget.spent.toFixed(2)} / ${budget.amount.toFixed(2)}
              </div>
              <Progress
                percent={percentage}
                status={percentage > 100 ? 'error' : 'normal'}
                formatText={() => `${percentage.toFixed(1)}%`}
              />
            </Card>
          );
        })}
      </div>
    </div>
  );
}
