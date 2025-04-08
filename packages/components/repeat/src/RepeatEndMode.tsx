import { RepeatEndMode } from './types';
import { DatePicker, InputNumber, Select } from '@arco-design/web-react';
import dayjs from 'dayjs';
import { useRepeatContext } from './context';
import useLocale from '@/utils/useLocale';
import i18n from './locale';

export const repeatEndModeMap = new Map<RepeatEndMode, string>([
  [RepeatEndMode.FOREVER, 'repeat.end.forever'],
  [RepeatEndMode.FOR_TIMES, 'repeat.end.forTimes'],
  [RepeatEndMode.TO_DATE, 'repeat.end.toDate'],
]);

export default function RepeatEndModeForm() {
  const { repeatEndModeForm, handleChangeRepeatEndMode, t } =
    useRepeatContext();

  return (
    <>
      <div className="text-sm text-text-3">
        <Select
          value={repeatEndModeForm.repeatEndMode}
          placeholder="结束重复"
          className="rounded-md w-full"
          allowClear
          onChange={(value) => {
            switch (value) {
              case RepeatEndMode.FOR_TIMES:
                handleChangeRepeatEndMode({
                  repeatEndMode: value,
                  repeatTimes: 1,
                });
                break;
              case RepeatEndMode.TO_DATE:
                handleChangeRepeatEndMode({
                  repeatEndMode: value,
                  repeatEndDate: dayjs(),
                });
                break;
              default:
                handleChangeRepeatEndMode({ repeatEndMode: value });
                break;
            }
          }}
          options={Array.from(repeatEndModeMap.entries()).map(
            ([key, value]) => ({
              value: key,
              label: t[value],
            }),
          )}
        />
      </div>

      {repeatEndModeForm.repeatEndMode === RepeatEndMode.FOR_TIMES && (
        <div className="flex items-center gap-2">
          <InputNumber
            value={repeatEndModeForm.repeatTimes}
            className="rounded-md w-full"
            onChange={(value) => {
              handleChangeRepeatEndMode({
                repeatEndMode: RepeatEndMode.FOR_TIMES,
                repeatTimes: value,
              });
            }}
            prefix={<div>重复</div>}
            suffix={<div>次后结束</div>}
          />
        </div>
      )}
      {repeatEndModeForm.repeatEndMode === RepeatEndMode.TO_DATE && (
        <div className="text-sm text-text-3">
          <DatePicker
            value={repeatEndModeForm.repeatEndDate}
            placeholder="请选择重复结束日期"
            className="rounded-md w-full"
            onChange={(value) => {
              handleChangeRepeatEndMode({
                repeatEndMode: RepeatEndMode.TO_DATE,
                repeatEndDate: dayjs(value),
              });
            }}
          />
        </div>
      )}
    </>
  );
}
