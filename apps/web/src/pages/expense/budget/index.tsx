import { FlexibleContainer } from '@life-toolkit/components-web-ui';
import { Button } from '@arco-design/web-react';
import { useCreateBudget } from './CreateBudget';
import { useExpenses } from '../context';
import BudgetTable from './BudgetTable';
import BudgetFilters from './BudgetFilters';
import { CreateButton } from '@/components/Button/CreateButton';
const { Fixed, Shrink } = FlexibleContainer;

export default function Budgets() {
  const { addBudget } = useExpenses();
  const { openCreateModal } = useCreateBudget({
    onConfirm: (values) => {
      addBudget(values);
    },
  });
  return (
    <FlexibleContainer className="bg-bg-2 rounded-lg w-full h-full">
      <Fixed className="px-5 py-2 flex justify-between items-center border-b">
        <div className="text-text-1 text-title-2 font-[500] py-1">预算</div>
      </Fixed>

      <Fixed className="px-5 py-2">
        <BudgetFilters />
      </Fixed>

      <Fixed className="px-5 py-2">
        <CreateButton onClick={openCreateModal}>添加预算</CreateButton>
      </Fixed>

      <Shrink className="px-5 w-full h-full">
        <div className="w-full py-2">
          <BudgetTable />
        </div>
      </Shrink>
    </FlexibleContainer>
  );
}
