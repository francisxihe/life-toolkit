import { Flex } from '@sue/design-web-react';
import { ProductSurface } from '@ylib/product-surface-react';
import { productRef } from '@ylib/product-server';
import { useCreateBudget } from './CreateBudget';
import { useExpenses } from '../context';
import BudgetTable from './BudgetTable';
import BudgetFilters from './BudgetFilters';
import { CreateButton } from '@true-north/plugin-ui';

export default function Budgets() {
  const { addBudget } = useExpenses();
  const { openCreateModal } = useCreateBudget({
    onConfirm: (values) => {
      addBudget(values);
    },
  });
  return (
    <ProductSurface id={productRef('expense.view.budget')}>
    <Flex
      vertical
      container="full"
      className="bg-bg-2 rounded-lg w-full h-full"
    >
      <Flex
        container="fixed"
        justify="space-between"
        align="center"
        className="w-full px-5 py-2 border-b"
      >
        <div className="text-text-1 text-title-2 font-[500] py-1">预算</div>
      </Flex>

      <Flex container="fixed" className="w-full px-5 py-2">
        <BudgetFilters />
      </Flex>

      <Flex container="fixed" className="w-full px-5 py-2">
        <CreateButton onClick={openCreateModal}>添加预算</CreateButton>
      </Flex>

      <Flex container="fill" className="px-5 w-full h-full">
        <div className="w-full py-2">
          <BudgetTable />
        </div>
      </Flex>
    </Flex>
    </ProductSurface>
  );
}
