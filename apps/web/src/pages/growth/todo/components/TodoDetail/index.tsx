import TodoDetailHeader from './Header';
import FlexibleContainer from '@/components/FlexibleContainer';
import { TodoVo } from '@life-toolkit/vo/growth';
import { TodoDetailProvider } from './context';
import TodoDetailMain from './Main';

export type TodoDetailProps = {
  todo: TodoVo;
  onClose: () => Promise<void>;
  onChange: (todo: TodoVo) => Promise<void>;
};

export default function TodoDetail(props: TodoDetailProps) {
  return (
    <TodoDetailProvider
      todo={props.todo}
      onClose={props.onClose}
      onChange={props.onChange}
    >
      <FlexibleContainer>
        <FlexibleContainer.Fixed>
          <TodoDetailHeader />
        </FlexibleContainer.Fixed>
        <FlexibleContainer.Shrink>
          <TodoDetailMain />
        </FlexibleContainer.Shrink>
      </FlexibleContainer>
    </TodoDetailProvider>
  );
}
