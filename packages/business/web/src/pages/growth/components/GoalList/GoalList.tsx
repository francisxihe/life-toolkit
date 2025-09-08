'use client';

import { GoalVo } from '@life-toolkit/vo';
import TriggerStatusCheckbox from './TriggerStatusCheckbox';
import GoalItem from './GoalItem';

function GoalList(props: {
  goalList: GoalVo[];
  onClickGoal: (id: string) => Promise<void>;
  refreshGoalList: () => Promise<void>;
}) {
  return (
    <div className="w-full mt-[-8px]">
      {props.goalList.map((goal) => (
        <GoalItem
          key={goal.id}
          goal={goal}
          onClickGoal={props.onClickGoal}
          refreshGoalList={props.refreshGoalList}
          TriggerCheckbox={
            <TriggerStatusCheckbox
              goal={goal}
              onChange={props.refreshGoalList}
            />
          }
        />
      ))}
    </div>
  );
}

export default GoalList;
