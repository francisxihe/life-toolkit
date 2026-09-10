import clsx from 'clsx';
import { Empty } from '@sue/design-web-react';
import { useGoalDetailContext } from '../context';
import GoalList from '../../GoalList/GoalList';
import { useGoalDetail } from '..';
import { CreateButton } from '@/components/Button/CreateButton';

export function GoalChildren(props: {
  onChangeGoal?: (id: string) => Promise<void>;
}) {
  const { currentGoal, refreshGoalDetail } = useGoalDetailContext();

  return currentGoal?.children?.length > 0 ? (
    <GoalList
      goalList={currentGoal.children}
      onClickGoal={async (id) => {
        await refreshGoalDetail(id);
        props.onChangeGoal?.(id);
      }}
      refreshGoalList={async () => {
        await refreshGoalDetail(currentGoal.id);
      }}
    />
  ) : (
    <div
      className={clsx(['w-full h-full', 'flex items-center justify-center'])}
    >
      <Empty description="暂无子目标" />
    </div>
  );
}

export function CreateGoal() {
  const { currentGoal, refreshGoalDetail } = useGoalDetailContext();
  const { CreatePopover: CreateGoalPopover } = useGoalDetail();

  return currentGoal ? (
    <div
      className={clsx([
        'text-title-1 text-text-1 font-medium',
        'flex justify-between items-center',
      ])}
    >
      <CreateGoalPopover
        creatorProps={{
          initialFormData: {
            parentId: currentGoal?.id,
          },
          afterSubmit: async () => {
            await refreshGoalDetail(currentGoal?.id);
          },
        }}
      >
        <CreateButton className="!px-2" type="text" size="small">
          添加子目标
        </CreateButton>
      </CreateGoalPopover>
    </div>
  ) : null;
}
