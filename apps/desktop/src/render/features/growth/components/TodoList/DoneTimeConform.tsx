import { Radio, DatePicker } from '@sue/design-web-react';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import { TodoVo } from '@true-north/vo';
import clsx from 'clsx';

export default function DoneTimeConform(props: {
  todo: TodoVo;
  onChangeDoneTime: (time: Dayjs) => void;
}) {
  const { todo, onChangeDoneTime } = props;
  const [doneType, setDoneType] = useState<
    'onTime' | 'currentTime' | 'customTime'
  >('onTime');

  const getPlanEndTime = () =>
    todo.planEndTime ? ' ' + todo.planEndTime : '23:59:59';
  useEffect(() => {
    console.log(todo.planDate + ' ' + getPlanEndTime());
    onChangeDoneTime(dayjs(todo.planDate + ' ' + getPlanEndTime()));
  }, []);

  return (
    <div className={clsx('flex flex-col gap-2')}>
      <div>
        当前时间已超过<b>{todo.name}</b>的计划完成时间
        <b>{`${todo.planDate} ${getPlanEndTime()}`}</b>
        ，确认完成时间
      </div>
      <Radio.Group
        value={doneType}
        onChange={(value) => {
          setDoneType(value);
          if (value === 'onTime') {
            onChangeDoneTime(dayjs(todo.planDate + ' ' + getPlanEndTime()));
          }
          if (value === 'currentTime') {
            onChangeDoneTime(dayjs());
          }
        }}
        options={[
          {
            label: '按时完成',
            value: 'onTime',
          },
          {
            label: '当前时间完成',
            value: 'currentTime',
          },
          {
            label: '自定义完成时间',
            value: 'customTime',
          },
        ]}
      />
      {doneType === 'customTime' && (
        <DatePicker
          showTime
          onChange={(time) => onChangeDoneTime(dayjs(time))}
        />
      )}
    </div>
  );
}
