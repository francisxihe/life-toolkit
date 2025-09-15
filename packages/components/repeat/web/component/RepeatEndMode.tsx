import { Select, InputNumber, DatePicker } from '@arco-design/web-react';
import { RepeatEndMode } from '../../types';
import { useRepeatContext } from './context';
import dayjs from 'dayjs';

export const repeatEndModeMap = new Map<RepeatEndMode, string>([
  [RepeatEndMode.FOREVER, 'repeat.end.forever'],
  [RepeatEndMode.FOR_TIMES, 'repeat.end.forTimes'],
  [RepeatEndMode.TO_DATE, 'repeat.end.toDate'],
]);

export default function RepeatEndModeForm() {
  const { repeatEndModeForm, handleChangeRepeatEndMode, t } = useRepeatContext();

  return (
    <>
      <div className={'repeat__text-secondary'}>
        <Select
          value={repeatEndModeForm.repeatEndMode}
          placeholder="结束重复"
          className={'repeat__select'}
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
          options={Array.from(repeatEndModeMap.entries()).map(([key, value]) => ({
            value: key,
            label: t[value],
          }))}
        />
      </div>

      {repeatEndModeForm.repeatEndMode === RepeatEndMode.FOR_TIMES && (
        <div className={'repeat__horizontal-container'}>
          <InputNumber
            value={repeatEndModeForm.repeatTimes}
            className={'repeat__input'}
            onChange={(value) => {
              if (value === undefined || value === null) {
                value = 1;
              }
              handleChangeRepeatEndMode({
                repeatEndMode: RepeatEndMode.FOR_TIMES,
                repeatTimes: value,
              });
            }}
            prefix={<div>重复</div>}
            suffix={<div>次后结束</div>}
            min={1}
            max={999}
          />
        </div>
      )}
      {repeatEndModeForm.repeatEndMode === RepeatEndMode.TO_DATE && (
        <div className={'repeat__text-secondary'}>
          <DatePicker
            value={repeatEndModeForm.repeatEndDate}
            placeholder="请选择重复结束日期"
            className={'repeat__date-picker'}
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
