import { Button } from '@arco-design/web-react';
import { IconClose } from '@arco-design/web-react/icon';
import dayjs from 'dayjs';
import FlexibleContainer from '@/components/FlexibleContainer';
import DateTimeTool from '../../../components/AddTodo/DateTimeTool';
import { useTodoDetailContext } from './context';
import IconSelector from '../../../components/IconSelector';
import { IMPORTANCE_MAP, URGENCY_MAP } from '../../../service/todo.constants';

export default function TodoDetailHeader() {
  const { todoFormData, setTodoFormData, onClose, onChange } =
    useTodoDetailContext();

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
            await onChange({ planDate: formData.date.format('YYYY-MM-DD') });
          }}
        />

        <IconSelector
          map={IMPORTANCE_MAP}
          iconName="priority-0"
          value={todoFormData.importance}
          onChange={(value) => {
            setTodoFormData((prev) => ({ ...prev, importance: value }));
          }}
        />
        <IconSelector
          map={URGENCY_MAP}
          iconName="urgency"
          value={todoFormData.urgency}
          onChange={(value) => {
            setTodoFormData((prev) => ({ ...prev, urgency: value }));
          }}
        />
      </FlexibleContainer.Shrink>
      <FlexibleContainer.Fixed className="flex items-center">
        {onClose ? (
          <Button
            type="text"
            size="small"
            icon={<IconClose className="!text-text-3" />}
            onClick={() => onClose()}
          />
        ) : null}
      </FlexibleContainer.Fixed>
    </FlexibleContainer>
  ) : (
    <></>
  );
}
