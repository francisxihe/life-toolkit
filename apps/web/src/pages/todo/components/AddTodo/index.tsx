'use client';

import { Input, Select, Popover } from '@arco-design/web-react';
import { IMPORTANCE_MAP, URGENCY_MAP } from '../../constants';
import { useState, useEffect } from 'react';
import SiteIcon from '@/components/SiteIcon';
import IconSelector from '../IconSelector';
const TextArea = Input.TextArea;
import DateTimeTool from './DateTimeTool';
import dayjs from 'dayjs';
import { TodoFormData } from '../../types';

export default function AddTodo(props: {
  hiddenDate?: boolean;
  initialFormData?: Partial<TodoFormData>;
  onChange?: (todoFormData: TodoFormData) => void;
  onSubmit?: (todoFormData: TodoFormData) => Promise<void>;
}) {
  const defaultFormData = {
    name: '',
    planDate: dayjs().format('YYYY-MM-DD'),
    subTodoList: [],
    ...props.initialFormData,
  };
  const [formData, setFormData] = useState<TodoFormData>({
    ...defaultFormData,
  });

  const onSubmit = () => {
    if (!formData.name) {
      return;
    }
    props.onSubmit?.(formData);
    setFormData(defaultFormData);
  };

  return (
    <div className="border rounded-md py-2">
      <div className="px-1">
        <Input
          value={formData.name}
          placeholder="准备做什么?"
          type="primary"
          size="small"
          className="text-body-3 !bg-transparent !border-none mb-1"
          onChange={async (value) => {
            const _formData = { ...formData, name: value };
            setFormData(_formData);
            props.onChange?.(_formData);
          }}
          onPressEnter={() => {
            onSubmit();
          }}
        />
      </div>

      <div className="flex items-center gap-2 px-2.5 text-text-3">
        {!props.hiddenDate && (
          <DateTimeTool
            formData={{
              date: dayjs(formData.planDate),
              timeRange: formData.planTimeRange as [string, string],
              recurring: formData.recurring,
            }}
            onChangeData={(data) => {
              const _formData = {
                ...formData,
                planDate: data.date.format('YYYY-MM-DD'),
                planTimeRange: data.timeRange,
                recurring: data.recurring as TodoFormData['recurring'],
              };
              setFormData(_formData);
              props.onChange?.(_formData);
            }}
          />
        )}
        <IconSelector
          map={IMPORTANCE_MAP}
          iconName="priority-0"
          value={formData.importance}
          onChange={(value) => {
            const _formData = { ...formData, importance: value };
            setFormData(_formData);
            props.onChange?.(_formData);
          }}
        />
        <IconSelector
          map={URGENCY_MAP}
          iconName="urgency"
          value={formData.urgency}
          onChange={(value) => {
            const _formData = { ...formData, urgency: value };
            setFormData(_formData);
            props.onChange?.(_formData);
          }}
        />
        <Popover
          content={
            <div className="p-1">
              <TextArea
                value={formData.description}
                placeholder="描述"
                className="text-body-3"
                onChange={(value) => {
                  const _formData = { ...formData, description: value };
                  setFormData(_formData);
                  props.onChange?.(_formData);
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
                  const _formData = { ...formData, tags: value };
                  setFormData(_formData);
                  props.onChange?.(_formData);
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
  );
}
