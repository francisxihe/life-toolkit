import FlexibleContainer from '@/components/FlexibleContainer';
import { TaskVo } from '@life-toolkit/vo/task';
import { TaskDetailProvider } from './context';
import TaskForm from './TaskForm';
import SubTaskList from './SubTaskList';

const { Shrink, Fixed } = FlexibleContainer;

export type TaskDetailProps = {
  task: TaskVo;
  onClose: () => Promise<void>;
  onChange: (task: TaskVo) => Promise<void>;
};

export default function TaskDetail(props: TaskDetailProps) {
  return (
    <TaskDetailProvider
      task={props.task}
      onClose={props.onClose}
      onChange={props.onChange}
    >
      <FlexibleContainer>
        <Fixed>
          <TaskForm />
        </Fixed>
        <Shrink>
          <SubTaskList />
        </Shrink>
      </FlexibleContainer>
    </TaskDetailProvider>
  );
}
