import TransactionTable from './TransactionTable';
import { TransactionFilters } from './TransactionFilters';
import { FlexibleContainer } from 'francis-component-react';
import { useExpenses } from '../context';
import { useCreateTransaction } from './CreateTransaction';
import { CreateButton } from '@/components/Button/CreateButton';

const { Fixed, Shrink } = FlexibleContainer;

export default function Transactions() {
  const { addTransaction } = useExpenses();
  const { openCreateModal } = useCreateTransaction({
    onConfirm: (values) => {
      addTransaction(values);
    },
  });
  return (
    <FlexibleContainer className="bg-bg-2 rounded-lg w-full h-full">
      <Fixed className="px-5 py-2 flex justify-between items-center border-b">
        <div className="text-text-1 text-title-2 font-[500] py-1">账单</div>
      </Fixed>
      <Fixed className="px-5 my-3">
        <TransactionFilters />
      </Fixed>
      <Fixed className="px-5 my-3">
        <CreateButton onClick={() => openCreateModal()}>记账</CreateButton>
      </Fixed>
      <Shrink className="px-5 my-3">
        <TransactionTable />
      </Shrink>
    </FlexibleContainer>
  );
}
