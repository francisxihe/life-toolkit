import FlexibleContainer from '@/components/Layout/FlexibleContainer';
import { BudgetOverview } from '../overview/budget-overview';

const { Fixed, Shrink } = FlexibleContainer;

export default function Overview() {
  return (
    <FlexibleContainer className="bg-bg-2 rounded-lg w-full h-full">
      <Fixed className="px-5 py-2 flex justify-between items-center border-b">
        <div className="text-text-1 text-title-2 font-[500] py-1">总览</div>
      </Fixed>

      <Shrink className="px-5 w-full h-full flex">
        <div className="w-full py-2">
          <BudgetOverview />
        </div>
      </Shrink>
    </FlexibleContainer>
  );
}
