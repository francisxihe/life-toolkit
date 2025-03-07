import { TodoFormData, TodoService } from '../../../service';
import { openModal } from '@/hooks/OpenModal';
import AddTodo from './AddTodo';
import { useRef } from 'react';

export default AddTodo;

export function useAddTodoModal() {
  const todoFormDataRef = useRef<TodoFormData>();

  const open = ({
    initialFormData,
    afterSubmit,
  }: {
    initialFormData?: Partial<TodoFormData>;
    afterSubmit?: (todoFormData: TodoFormData) => Promise<void>;
  }) => {
    openModal({
      title: <div className="text-title">添加待办</div>,
      content: (
        <AddTodo
          initialFormData={initialFormData}
          onChange={(todoFormData) => {
            todoFormDataRef.current = todoFormData;
          }}
          onSubmit={async (todoFormData) => {
            await TodoService.addTodo({
              name: todoFormData.name,
              importance: todoFormData.importance,
              urgency: todoFormData.urgency,
              planDate: todoFormData.planDate || undefined,
              planStartAt: todoFormData.planTimeRange?.[0] || undefined,
              planEndAt: todoFormData.planTimeRange?.[1] || undefined,
              repeat: todoFormData.repeat,
              tags: todoFormData.tags,
            });
            afterSubmit?.(todoFormData);
          }}
        />
      ),
      onOk: async () => {
        const todoFormData = todoFormDataRef.current;
        await TodoService.addTodo({
          name: todoFormData.name,
          importance: todoFormData.importance,
          urgency: todoFormData.urgency,
          planDate: todoFormData.planDate || undefined,
          planStartAt: todoFormData.planTimeRange?.[0] || undefined,
          planEndAt: todoFormData.planTimeRange?.[1] || undefined,
          repeat: todoFormData.repeat,
          tags: todoFormData.tags,
        });
        afterSubmit?.(todoFormData);
      },
    });
  };

  return { open };
}
