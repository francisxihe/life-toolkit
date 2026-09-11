'use client';

import { GoalVo } from '@true-north/vo';
import GoalItem from './GoalItem';
import clsx from 'clsx';

function GoalList(props: {
  goalList: GoalVo[];
  onClickGoal: (id: string) => Promise<void>;
  refreshGoalList: () => Promise<void>;
}) {
  return (
    <div className={clsx('w-full mt-[-8px]', 'flex flex-col gap-2')}>
      {props.goalList.map((goal) => (
        <GoalItem
          key={goal.id}
          goal={goal}
          onClickGoal={props.onClickGoal}
          refreshGoalList={props.refreshGoalList}
        />
      ))}
    </div>
  );
}

export default GoalList;
