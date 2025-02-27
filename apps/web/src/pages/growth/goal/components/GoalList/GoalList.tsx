'use client';

import { GoalVo } from '@life-toolkit/vo/goal';
import TriggerStatusCheckbox from './TriggerStatusCheckbox';
import GoalItem from './GoalItem';

function GoalList(props: {
  goalList: GoalVo[];
  onClickGoal: (id: string) => Promise<void>;
  refreshGoalList: () => Promise<void>;
}) {
  return (
    <div className="w-full mt-[-8px]">
      {props.goalList.map((todo) => (
        <GoalItem
          key={todo.id}
          todo={todo}
          onClickGoal={props.onClickGoal}
          refreshGoalList={props.refreshGoalList}
          TriggerCheckbox={
            <TriggerStatusCheckbox
              todo={todo}
              type="todo"
              onChange={props.refreshGoalList}
            />
          }
        />
      ))}
    </div>
  );
}

export default GoalList;
