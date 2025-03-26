import dayjs from 'dayjs';
import FlexibleContainer from '@/components/Layout/FlexibleContainer';
import DateTimeTool from '../DateTimeTool';
import { useTodoDetailContext } from '../context';
import IconSelector from '../../IconSelector';
import { IMPORTANCE_MAP, URGENCY_MAP } from '../../../service/todo.constants';

export default function TodoEditorHeader() {
  const { todoFormData, setTodoFormData, onSubmit } = useTodoDetailContext();

  return todoFormData ? (
    <FlexibleContainer
      direction="vertical"
      className="flex items-center px-1.5 text-text-3 border-b mb-2 !h-12"
    >
      <FlexibleContainer.Shrink className="flex items-center">
        <DateTimeTool
          formData={{
            date: dayjs(todoFormData.planDate),
            timeRange: todoFormData.planTimeRange,
            repeat: todoFormData.repeat,
          }}
          onChangeData={async (formData) => {
            setTodoFormData({
              ...todoFormData,
              planDate: formData.date.format('YYYY-MM-DD'),
              planTimeRange: formData.timeRange,
              repeat: formData.repeat as
                | 'none'
                | 'daily'
                | 'weekly'
                | 'monthly',
              // | 'yearly',
            });
            await onSubmit();
          }}
        />

        <IconSelector
          map={IMPORTANCE_MAP}
          iconName="priority-0"
          value={todoFormData.importance}
          onChange={(value) => {
            setTodoFormData({ importance: value });
          }}
        />
        <IconSelector
          map={URGENCY_MAP}
          iconName="urgency"
          value={todoFormData.urgency}
          onChange={(value) => {
            setTodoFormData({ urgency: value });
          }}
        />
      </FlexibleContainer.Shrink>
    </FlexibleContainer>
  ) : (
    <></>
  );
}
