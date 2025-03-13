import FlexibleContainer from '@/components/Layout/FlexibleContainer';
import { TodoVo } from '@life-toolkit/vo/growth';
import { TodoDetailProvider } from './context';
import TodoEditorMain from './TodoEditorMain';
import TodoEditorHeader from './TodoEditorHeader';

const { Fixed, Shrink } = FlexibleContainer;

export type TodoEditorProps = {
  todo: TodoVo;
  onClose?: () => void;
  afterSubmit: () => Promise<void>;
};

export default function TodoEditor(props: TodoEditorProps) {
  return (
    <TodoDetailProvider
      todo={props.todo}
      mode="editor"
      afterSubmit={props.afterSubmit}
    >
      <FlexibleContainer>
        <Fixed>
          <TodoEditorHeader />
        </Fixed>
        <Shrink>
          <TodoEditorMain />
        </Shrink>
      </FlexibleContainer>
    </TodoDetailProvider>
  );
}
