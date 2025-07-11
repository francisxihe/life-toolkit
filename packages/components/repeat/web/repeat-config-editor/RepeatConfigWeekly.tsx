import { Select } from '@arco-design/web-react';
import { WeekDayMap } from '../constants';
import { useLocaleContext } from '../useLocale';
import { RepeatFormWeekly } from '../../types';

export default function RepeatConfigWeekly(props: {
  repeatConfig: RepeatFormWeekly['repeatConfig'];
  handleConfigChange: (repeatConfig: RepeatFormWeekly['repeatConfig']) => void;
}) {
  const { repeatConfig, handleConfigChange } = props;
  const { t } = useLocaleContext();

  return (
    <div className="flex gap-2 items-center">
      <Select
        placeholder="选择周几"
        mode="multiple"
        value={repeatConfig.weekdays}
        className="rounded-md w-full"
        onChange={(value) => handleConfigChange({ ...repeatConfig, weekdays: value })}
        options={Array.from(WeekDayMap.entries()).map(([key, value]) => ({
          value: key,
          label: t[value],
        }))}
      />
    </div>
  );
}
