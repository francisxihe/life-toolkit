import { Input } from '@arco-design/web-react';
import clsx from 'clsx';
import { useTodoDetailContext } from '../context';

const TextArea = Input.TextArea;

export default function TodoEditorMain() {
  const { todoFormData, setTodoFormData, onSubmit } = useTodoDetailContext();

  return todoFormData ? (
    <>
      <Input
        value={todoFormData.name}
        placeholder="准备做什么?"
        type="primary"
        size="small"
        className="!text-text-1 !bg-transparent !border-none mb-1"
        onChange={(value) => {
          setTodoFormData({ name: value });
        }}
        onBlur={() => {
          onSubmit();
        }}
      />
      <TextArea
        autoSize={false}
        value={todoFormData.description}
        placeholder="描述一下"
        className={clsx(
          '!text-text-3 !text-body-1 !bg-transparent !border-none mb-1',
        )}
        onChange={(value) => {
          setTodoFormData({ description: value });
        }}
      />
    </>
  ) : null;
}
