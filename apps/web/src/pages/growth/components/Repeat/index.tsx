import { Select, Input, DatePicker, InputNumber } from '@arco-design/web-react';
import { useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';

export enum Repeat {
  NONE = 'none',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  WEEKDAYS = 'weekdays',
  WEEKEND = 'weekend',
  WORKDAYS = 'workdays',
  HOLIDAY = 'holiday',
  CUSTOM = 'custom',
}

export enum RepeatEnd {
  FOREVER = 'forever',
  FOR_TIMES = 'forTimes',
  TO_DATE = 'toDate',
}

export const RECURRENCE_PATTERNS = {
  [Repeat.DAILY]: '每日',
  [Repeat.WEEKLY]: '每周',
  [Repeat.MONTHLY]: '每月',
  [Repeat.YEARLY]: '每年',
  [Repeat.WEEKDAYS]: '每周工作日',
  [Repeat.WEEKEND]: '每周周末',
  [Repeat.WORKDAYS]: '法定工作日',
  [Repeat.HOLIDAY]: '法定节假日',
  [Repeat.CUSTOM]: '自定义',
} as const;

export const REPEAT_END_PATTERNS = {
  [RepeatEnd.FOREVER]: '一直重复',
  [RepeatEnd.FOR_TIMES]: '按次数结束重复',
  [RepeatEnd.TO_DATE]: '按日期结束重复',
} as const;

// 每1～n天
// 每1～n周:周一～周日
// 每1～n月:1～31号;1～5周，周一～周日;工作日;节假日
// 每1～n年:1月1日～12月31日

export function RepeatSelector(props: { onChange: (repeat: Repeat) => void }) {
  const [repeat, setRepeat] = useState();
  const [customRepeat, setCustomRepeat] = useState();
  const [repeatEnd, setRepeatEnd] = useState();
  const [repeatTimes, setRepeatTimes] = useState<number>();
  const [repeatEndDate, setRepeatEndDate] = useState<Dayjs>();

  return (
    <div className="px-3">
      <Select
        value={repeat}
        placeholder="选择重复模式"
        className="rounded-md"
        allowClear
        onChange={(value) => {
          setRepeat(value);
        }}
        options={Object.entries(RECURRENCE_PATTERNS).map(([value, label]) => ({
          value,
          label,
        }))}
      />
      {repeat === Repeat.CUSTOM && (
        <>
          每
          <InputNumber className="rounded-md" />
          <Select
            value={customRepeat}
            className="rounded-md"
            allowClear
            onChange={(value) => {
              setCustomRepeat(value);
            }}
            options={['天', '周', '月', '年'].map((label) => ({
              value: label,
              label,
            }))}
          />
          跳过法定节假日
        </>
      )}

      <div className="text-sm text-text-3">
        <Select
          value={repeatEnd}
          placeholder="结束重复"
          className="rounded-md"
          allowClear
          onChange={(value) => {
            setRepeatEnd(value);
          }}
          options={Object.entries(REPEAT_END_PATTERNS).map(
            ([value, label]) => ({
              value,
              label,
            }),
          )}
        />
      </div>

      {repeatEnd === RepeatEnd.FOR_TIMES && (
        <div className="flex items-center gap-2">
          <InputNumber
            value={repeatTimes}
            className="rounded-md"
            onChange={(value) => {
              setRepeatTimes(value);
            }}
            prefix={<div>重复</div>}
            suffix={<div>次后结束</div>}
          />
        </div>
      )}
      {repeatEnd === RepeatEnd.TO_DATE && (
        <div className="text-sm text-text-3">
          <DatePicker
            value={repeatEndDate}
            placeholder="请选择重复结束日期"
            className="rounded-md"
            onChange={(value) => {
              setRepeatEndDate(dayjs(value));
            }}
          />
        </div>
      )}
    </div>
  );
}
