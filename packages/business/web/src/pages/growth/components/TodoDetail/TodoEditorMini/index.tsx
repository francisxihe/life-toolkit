import { FlexibleContainer } from 'francis-component-react';
import { TodoVo } from '@life-toolkit/vo/growth';
import { TodoDetailProvider } from '../context';
import TodoEditorMain from './TodoEditorMain';
import TodoEditorHeader from './TodoEditorHeader';

const { Fixed, Shrink } = FlexibleContainer;

export type TodoEditorSimpleProps = {
  todo: TodoVo;
  onClose?: () => void;
  afterSubmit: () => Promise<void>;
};

export default function TodoEditorMini(props: TodoEditorSimpleProps) {
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
