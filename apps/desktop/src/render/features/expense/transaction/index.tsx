import TransactionTable from './TransactionTable';
import { TransactionFilters } from './TransactionFilters';
import { Flex } from '@sue/design-web-react';
import { useExpenses } from '../context';
import { useCreateTransaction } from './CreateTransaction';
import { CreateButton } from '@/components/Button/CreateButton';

export default function Transactions() {
  const { addTransaction } = useExpenses();
  const { openCreateModal } = useCreateTransaction({
    onConfirm: (values) => {
      addTransaction(values);
    },
  });
  return (
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
        <div className="text-text-1 text-title-2 font-[500] py-1">账单</div>
      </Flex>
      <Flex container="fixed" className="w-full px-5 my-3">
        <TransactionFilters />
      </Flex>
      <Flex container="fixed" className="w-full px-5 my-3">
        <CreateButton onClick={() => openCreateModal()}>记账</CreateButton>
      </Flex>
      <Flex container="fill" className="px-5 my-3">
        <TransactionTable />
      </Flex>
    </Flex>
  );
}
