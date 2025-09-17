import { Select, InputNumber } from '@arco-design/web-react';
import { RepeatFormCustom, TimeUnit } from '@life-toolkit/service-repeat-types';
import RepeatConfigMonthly from './RepeatConfigMonthly';
import RepeatConfigYearly from './RepeatConfigYearly';
import RepeatConfigWeekly from './RepeatConfigWeekly';

export default function RepeatConfigCustom(props: {
  repeatConfig: RepeatFormCustom['repeatConfig'];
  handleConfigChange: (repeatConfig: RepeatFormCustom['repeatConfig']) => void;
}) {
  const { repeatConfig: customConfig, handleConfigChange } = props;

  return (
    <div className={'repeat__vertical-container'}>
      <div className={'repeat__horizontal-container'}>
        <span>每</span>
        <InputNumber
          value={customConfig.interval}
          onChange={(value) => {
            if (value === undefined || value === null) {
              value = 1;
            }
            handleConfigChange({ ...customConfig, interval: value });
          }}
          className={'repeat__input'}
          min={1}
          max={999}
        />
        <Select
          value={customConfig.intervalUnit}
          onChange={(value) => handleConfigChange({ ...customConfig, intervalUnit: value })}
          className={'repeat__select'}
          options={[
            { value: 'day', label: '天' },
            { value: 'week', label: '周' },
            { value: 'month', label: '月' },
            { value: 'year', label: '年' },
          ]}
        />
      </div>

      {customConfig.intervalUnit === 'week' && (
        <RepeatConfigWeekly
          repeatConfig={customConfig[TimeUnit.WEEK]}
          handleConfigChange={(repeatConfig) => {
            handleConfigChange({
              ...customConfig,
              [TimeUnit.WEEK]: {
                weekdays: repeatConfig.weekdays,
              },
            });
          }}
        />
      )}

      {customConfig.intervalUnit === 'month' && (
        <RepeatConfigMonthly
          repeatConfig={customConfig[TimeUnit.MONTH]}
          handleConfigChange={(repeatConfig) => {
            handleConfigChange({
              ...customConfig,
              [TimeUnit.MONTH]: repeatConfig,
            });
          }}
        />
      )}

      {customConfig.intervalUnit === 'year' && (
        <RepeatConfigYearly
          repeatConfig={customConfig[TimeUnit.YEAR]}
          handleConfigChange={(repeatConfig) =>
            handleConfigChange({
              ...customConfig,
              [TimeUnit.YEAR]: repeatConfig,
            })
          }
        />
      )}
    </div>
  );
}
