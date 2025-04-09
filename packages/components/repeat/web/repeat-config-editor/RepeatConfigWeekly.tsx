import { Select } from '@arco-design/web-react';
import { WeekDayMap } from '../constants';
import { useLocaleContext } from '../useLocale';
import { RepeatFormWeekly } from '../../types';

export default function RepeatConfigWeekly(props: {
  config: RepeatFormWeekly['config'];
  handleConfigChange: (config: RepeatFormWeekly['config']) => void;
}) {
  const { config, handleConfigChange } = props;
  const { t } = useLocaleContext();

  return (
    <div className="flex gap-2 items-center">
      <Select
        placeholder="选择周几"
        mode="multiple"
        value={config.weekdays}
        className="rounded-md w-full"
        onChange={(value) => handleConfigChange({ ...config, weekdays: value })}
        options={Array.from(WeekDayMap.entries()).map(([key, value]) => ({
          value: key,
          label: t[value],
        }))}
      />
    </div>
  );
}
