'use client';

import { Input, Select, Popover } from '@arco-design/web-react';
import { IMPORTANCE_MAP, URGENCY_MAP } from '../../constants';
import { TodoFormData } from '../../service';
import { SiteIcon } from '@life-toolkit/components-web-ui';
import IconSelector from '../IconSelector';
import DateTimeTool from './DateTimeTool';
import dayjs from 'dayjs';
import { useTodoDetailContext, TodoDetailProvider } from './context';
import { CreateButton } from '@/components/Button/CreateButton';

export type TodoCreatorProps = {
  hiddenDate?: boolean;
  showSubmitButton?: boolean;
  initialFormData?: Partial<TodoFormData>;
  onClose?: () => Promise<void>;
  afterSubmit?: () => Promise<void>;
};

export default function TodoCreator(props: TodoCreatorProps) {
  return (
    <TodoDetailProvider
      mode="creator"
      initialFormData={props.initialFormData}
      afterSubmit={props.afterSubmit}
    >
      <TodoCreatorMain
        hiddenDate={props.hiddenDate}
        showSubmitButton={props.showSubmitButton}
      />
    </TodoDetailProvider>
  );
}

function TodoCreatorMain(props: {
  hiddenDate?: boolean;
  showSubmitButton?: boolean;
}) {
  const { todoFormData, setTodoFormData, onSubmit } = useTodoDetailContext();

  return (
    <>
      <div className="border rounded-md py-2">
        <div className="px-1">
          <Input
            value={todoFormData.name}
            placeholder="准备做什么?"
            type="primary"
            size="small"
            className="text-body-3 !bg-transparent !border-none mb-1"
            onChange={async (value) => {
              setTodoFormData({ ...todoFormData, name: value });
            }}
          />
        </div>

        <div className="flex items-center gap-2 px-2.5 text-text-3">
          {!props.hiddenDate && (
            <DateTimeTool
              formData={{
                date: dayjs(todoFormData.planDate),
                timeRange: todoFormData.planTimeRange as [string, string],
                repeat: todoFormData.repeat,
              }}
              onChangeData={(data) => {
                const _formData = {
                  ...todoFormData,
                  planDate: data.date.format('YYYY-MM-DD'),
                  planTimeRange: data.timeRange,
                  repeat: data.repeat as TodoFormData['repeat'],
                };
                setTodoFormData(_formData);
              }}
            />
          )}
          <IconSelector
            map={IMPORTANCE_MAP}
            iconName="priority-0"
            value={todoFormData.importance}
            onChange={(value) => {
              const _formData = { ...todoFormData, importance: value };
              setTodoFormData(_formData);
            }}
          />
          <IconSelector
            map={URGENCY_MAP}
            iconName="urgency"
            value={todoFormData.urgency}
            onChange={(value) => {
              const _formData = { ...todoFormData, urgency: value };
              setTodoFormData(_formData);
            }}
          />
          <Popover
            content={
              <div className="p-1">
                <Input.TextArea
                  value={todoFormData.description}
                  placeholder="描述"
                  className="text-body-3"
                  onChange={(value) => {
                    const _formData = { ...todoFormData, description: value };
                    setTodoFormData(_formData);
                  }}
                />
              </div>
            }
            trigger="click"
          >
            <div className="px-1.5 h-7 rounded-sm hover:bg-fill-3 flex items-center cursor-pointer">
              <SiteIcon
                id="description"
                width={16}
                height={16}
                className={`cursor-pointer`}
              />
            </div>
          </Popover>

          <Popover
            content={
              <div className="p-1">
                <Select
                  mode="multiple"
                  allowCreate={true}
                  placeholder="添加标签..."
                  className="rounded-md"
                  onChange={(value) => {
                    const _formData = { ...todoFormData, tags: value };
                    setTodoFormData(_formData);
                  }}
                />
              </div>
            }
            trigger="click"
          >
            <div className="px-1.5 h-7 rounded-sm hover:bg-fill-3 flex items-center cursor-pointer">
              <SiteIcon
                id="tag"
                width={16}
                height={16}
                className={`cursor-pointer`}
              />
            </div>
          </Popover>
        </div>
      </div>
      <div className="flex justify-end mt-4">
        <CreateButton
          type="outline"
          size="small"
          onClick={() => {
            onSubmit();
          }}
        >
          提交
        </CreateButton>
      </div>
    </>
  );
}
