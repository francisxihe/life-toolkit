'use client';

import { GoalVo } from '@life-toolkit/vo/growth';
import TriggerStatusCheckbox from './TriggerStatusCheckbox';
import GoalItem from './GoalItem';

function SubGoalList(props: {
  goalList: GoalVo[];
  onClickGoal: (id: string) => Promise<void>;
  refreshGoalList: () => Promise<void>;
}) {
  return (
    <div className='w-full'>
      {props.goalList.map((todo) => (
        <GoalItem
          key={todo.id}
          todo={todo}
          onClickGoal={props.onClickGoal}
          refreshGoalList={props.refreshGoalList}
          TriggerCheckbox={
            <TriggerStatusCheckbox
              todo={todo}
              type="sub-todo"
              onChange={async () => {
                await props.refreshGoalList();
              }}
            />
          }
        />
      ))}
    </div>
  );
}

export default SubGoalList;
