import {
  Input,
  Button,
  Popover,
  Grid,
  DatePicker,
} from '@arco-design/web-react';
import { useGoalDetailContext } from './context';
import SubGoalList from '../GoalList/SubGoalList';
import SiteIcon from '@/components/SiteIcon';
import AddGoalPopover from '../AddGoalPopover';
import clsx from 'clsx';

export default function GoalDetailSubGoalList() {
  const { currentGoal, showSubGoal, refreshGoalDetail } =
    useGoalDetailContext();

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="text-title-1 text-text-1 font-medium px-2">子目标</div>
      {currentGoal?.children && (
        <SubGoalList
          goalList={currentGoal.children}
          onClickGoal={async (id) => {
            await showSubGoal(id);
          }}
          refreshGoalList={async () => {
            await refreshGoalDetail(currentGoal.id);
          }}
        />
      )}
      <AddGoalPopover
        key={currentGoal.id}
        initialFormData={{
          parentId: currentGoal.id,
        }}
        afterSubmit={async () => {
          await refreshGoalDetail(currentGoal.id);
        }}
      >
        <Button className="!px-2" type="text" size="small">
          <div className="flex items-center gap-1">
            <SiteIcon id="add" />
            添加子目标
          </div>
        </Button>
      </AddGoalPopover>
    </div>
  );
}
