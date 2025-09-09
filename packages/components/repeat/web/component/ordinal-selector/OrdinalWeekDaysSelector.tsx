import { Select } from '@arco-design/web-react';
import { useLocaleContext } from '../useLocale';
import { WeekDayMap } from '../constants';
import { WeekDay, OrdinalWeek } from '../../../types';

export const OrdinalMap = new Map<OrdinalWeek, string>([
  [OrdinalWeek.FIRST, 'first'],
  [OrdinalWeek.SECOND, 'second'],
  [OrdinalWeek.THIRD, 'third'],
  [OrdinalWeek.FOURTH, 'fourth'],
  [OrdinalWeek.SECOND_LAST, 'secondLast'],
  [OrdinalWeek.LAST, 'last'],
]);

export default function OrdinalWeekDaysSelector({
  ordinal,
  setOrdinal,
  ordinalWeekDays,
  setOrdinalWeekDays,
}: {
  ordinal: OrdinalWeek;
  setOrdinal: (value: OrdinalWeek) => void;
  ordinalWeekDays: WeekDay[];
  setOrdinalWeekDays: (value: WeekDay[]) => void;
}) {
  const { t } = useLocaleContext();

  return (
    <>
      <Select
        placeholder="选择周"
        value={ordinal}
        options={Array.from(OrdinalMap.entries()).map(([key, value]) => {
          return {
            value: key,
            label: t[value],
          };
        })}
        onChange={(value) => {
          setOrdinal(value);
        }}
      />
      <Select
        placeholder="选择周几"
        mode="multiple"
        value={ordinalWeekDays}
        className="rounded-md w-24"
        onChange={(value) => setOrdinalWeekDays(value)}
        options={Array.from(WeekDayMap.entries()).map(([key, value]) => ({
          value: key,
          label: t[value],
        }))}
      />
    </>
  );
}
