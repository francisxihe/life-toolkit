'use client';

import { Input, DatePicker, Popover, Button } from '@arco-design/web-react';
import { useState } from 'react';
import { TaskFormData, TaskService } from '../../service';

const RangePicker = DatePicker.RangePicker;

export default function AddTaskPopover(
  props: {
    initialFormData?: Partial<TaskFormData>;
    afterSubmit?: (formData: TaskFormData) => void;
  } & React.ComponentProps<typeof Popover>,
) {
  const defaultFormData: TaskFormData = {
    name: '',
    planTimeRange: [undefined, undefined],
    children: [],
    ...props.initialFormData,
  };

  const [formData, setFormData] = useState<TaskFormData>({
    ...defaultFormData,
  });

  const [popupVisible, setPopupVisible] = useState<boolean>(false);

  const onSubmit = async () => {
    if (!formData.name) {
      return;
    }
    await TaskService.addTask({
      name: formData.name,
      startAt: formData.planTimeRange?.[0] || undefined,
      endAt: formData.planTimeRange?.[1] || undefined,
      parentId: formData.parentId,
      children: [],
    });
    setPopupVisible(false);
    setFormData(defaultFormData);
    props.afterSubmit?.(formData);
  };

  return (
    <Popover
      trigger="click"
      popupVisible={popupVisible}
      onVisibleChange={(visible) => {
        setPopupVisible(visible);
      }}
      position="bl"
      style={{
        maxWidth: 'unset',
      }}
      content={
        <div className="p-2 flex flex-col gap-2 w-96">
          <Input
            value={formData.name}
            placeholder="准备做什么?"
            type="primary"
            size="small"
            className="text-body-3"
            onChange={async (value) => {
              setFormData((prev) => ({
                ...prev,
                name: value,
              }));
            }}
            onPressEnter={() => {
              onSubmit();
            }}
          />

          <div className="flex items-center gap-2 text-text-3 mb-2">
            <RangePicker
              prefix={<span className="text-text-3 leading-[20px]">日期</span>}
              value={formData.planTimeRange}
              className="w-full rounded-md"
              allowClear
              showTime
              format="YYYY-MM-DD HH:mm"
              onChange={(time) => {
                if (!time?.[0] || !time?.[1]) {
                  return;
                }
                setFormData((prev) => ({
                  ...prev,
                  planTimeRange: [time[0], time[1]] as [string, string],
                }));
              }}
            />
          </div>
          <div className="flex justify-end">
            <Button
              type="outline"
              size="small"
              disabled={!formData.name}
              onClick={onSubmit}
            >
              提交
            </Button>
          </div>
        </div>
      }
    >
      <span className="cursor-pointer" onClick={() => setPopupVisible(true)}>
        {props.children}
      </span>
    </Popover>
  );
}
