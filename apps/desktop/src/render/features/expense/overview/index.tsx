import { Flex } from '@sue/design-web-react';
import { BudgetOverview } from './BudgetOverview';

export default function Overview() {
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
        <div className="text-text-1 text-title-2 font-[500] py-1">总览</div>
      </Flex>

      <Flex container="fill" className="px-5 w-full h-full flex">
        <div className="w-full py-2">
          <BudgetOverview />
        </div>
      </Flex>
    </Flex>
  );
}
