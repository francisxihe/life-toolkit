import TodoDetailHeader from './Header';
import FlexibleContainer from '@/components/FlexibleContainer';
import { Todo } from '../../service/types';
import { TodoDetailProvider } from './context';
import TodoDetailMain from './Main';

export default function TodoDetail(props: {
  todo: Todo;
  onClose: () => Promise<void>;
  onChange: (todo: Todo) => Promise<void>;
}) {
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
