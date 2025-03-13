import { useGoalDetailContext } from './context';
import GoalList from '../GoalList/GoalList';
import { useGoalDetail } from '.';
import { CreateButton } from '@/components/Button/CreateButton';
import clsx from 'clsx';

export default function GoalChildren() {
  const { currentGoal, showSubGoal, refreshGoalDetail } =
    useGoalDetailContext();

  const { CreateGoalPopover } = useGoalDetail();

  return currentGoal ? (
    <div className="w-full flex flex-col gap-2">
      <div
        className={clsx([
          'text-title-1 text-text-1 font-medium p-2',
          'flex justify-between items-center',
        ])}
      >
        子目标
        <CreateGoalPopover
          creatorProps={{
            initialFormData: {
              parentId: currentGoal.id,
            },
            afterSubmit: async () => {
              await refreshGoalDetail(currentGoal.id);
            },
          }}
        >
          <CreateButton className="!px-2" type="text" size="small">
            添加子目标
          </CreateButton>
        </CreateGoalPopover>
      </div>
      {currentGoal.children && (
        <GoalList
          goalList={currentGoal.children}
          onClickGoal={async (id) => {
            await showSubGoal(id);
          }}
          refreshGoalList={async () => {
            await refreshGoalDetail(currentGoal.id);
          }}
        />
      )}
    </div>
  ) : null;
}
