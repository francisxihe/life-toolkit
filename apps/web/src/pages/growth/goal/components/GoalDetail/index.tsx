import FlexibleContainer from '@/components/FlexibleContainer';
import { GoalVo } from '@life-toolkit/vo/goal';
import { GoalDetailProvider } from './context';
import GoalForm from './GoalForm';
import SubGoalList from './SubGoalList';

const { Shrink, Fixed } = FlexibleContainer;

export type GoalDetailProps = {
  goal: GoalVo;
  onClose: () => Promise<void>;
  onChange: (goal: GoalVo) => Promise<void>;
};

export default function GoalDetail(props: GoalDetailProps) {
  return (
    <GoalDetailProvider
      goal={props.goal}
      onClose={props.onClose}
      onChange={props.onChange}
    >
      <FlexibleContainer>
        <Fixed>
          <GoalForm />
        </Fixed>
        <Shrink>
          <SubGoalList />
        </Shrink>
      </FlexibleContainer>
    </GoalDetailProvider>
  );
}
