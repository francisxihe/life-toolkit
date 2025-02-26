import { Input, Button, Popover } from '@arco-design/web-react';
import { useTodoDetailContext } from './context';
import clsx from 'clsx';

const TextArea = Input.TextArea;

export default function TodoDetailMain() {
  const { todoFormData, setTodoFormData, onChange } = useTodoDetailContext();

  return todoFormData ? (
    <>
      <Input
        value={todoFormData.name}
        placeholder="准备做什么?"
        type="primary"
        size="small"
        className="!text-text-1 !bg-transparent !border-none mb-1"
        onChange={(value) => {
          setTodoFormData((prev) => ({ ...prev, name: value }));
        }}
        onBlur={() => {
          onChange(todoFormData);
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
          setTodoFormData((prev) => ({
            ...prev,
            description: value,
          }));
        }}
      />
    </>
  ) : (
    <></>
  );
}
