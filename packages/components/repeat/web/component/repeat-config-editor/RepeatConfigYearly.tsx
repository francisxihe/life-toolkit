import { Radio } from '@arco-design/web-react';
import { RepeatFormYearly, YearlyType, MonthlyType, WeekDay, OrdinalWeek } from '../../../types';
import RepeatConfigMonthly from './RepeatConfigMonthly';
import { OrdinalWeekDaysSelector } from '../ordinal-selector';

export default function RepeatConfigYearly(props: {
  repeatConfig: RepeatFormYearly['repeatConfig'];
  handleConfigChange: (repeatConfig: RepeatFormYearly['repeatConfig']) => void;
}) {
  const { repeatConfig: yearlyConfig, handleConfigChange } = props;

  return (
    <div className={'repeat__vertical-container-sm'}>
      <Radio.Group
        className={'repeat__radio-group'}
        type="button"
        value={yearlyConfig.yearlyType || YearlyType.MONTH}
        onChange={(value) => {
          switch (value) {
            case YearlyType.MONTH:
              handleConfigChange({
                yearlyType: YearlyType.MONTH,
                month: { monthlyType: MonthlyType.DAY, [MonthlyType.DAY]: 1 },
              });
              break;
            case YearlyType.ORDINAL_WEEK:
              handleConfigChange({
                yearlyType: YearlyType.ORDINAL_WEEK,
                [YearlyType.ORDINAL_WEEK]: {
                  ordinalWeek: OrdinalWeek.FIRST,
                  ordinalWeekdays: [WeekDay.MONDAY],
                },
              });
              break;
            default:
              break;
          }
        }}
      >
        <Radio value={YearlyType.ORDINAL_WEEK}>按星期</Radio>
        <Radio value={YearlyType.MONTH}>按月</Radio>
      </Radio.Group>

      {yearlyConfig.yearlyType === YearlyType.MONTH && (
        <RepeatConfigMonthly
          repeatConfig={yearlyConfig[YearlyType.MONTH]}
          handleConfigChange={(repeatConfig) => {
            handleConfigChange({
              yearlyType: YearlyType.MONTH,
              [YearlyType.MONTH]: repeatConfig,
            });
          }}
        />
      )}

      {yearlyConfig.yearlyType === YearlyType.ORDINAL_WEEK && (
        <div className={'repeat__horizontal-container'}>
          <div className={'repeat__label'}>每年</div>
          <OrdinalWeekDaysSelector
            ordinal={yearlyConfig[YearlyType.ORDINAL_WEEK].ordinalWeek}
            setOrdinal={(value) => {
              handleConfigChange({
                yearlyType: YearlyType.ORDINAL_WEEK,
                [YearlyType.ORDINAL_WEEK]: {
                  ...yearlyConfig[YearlyType.ORDINAL_WEEK],
                  ordinalWeek: value,
                },
              });
            }}
            ordinalWeekDays={yearlyConfig[YearlyType.ORDINAL_WEEK].ordinalWeekdays}
            setOrdinalWeekDays={(value) => {
              handleConfigChange({
                yearlyType: YearlyType.ORDINAL_WEEK,
                [YearlyType.ORDINAL_WEEK]: {
                  ...yearlyConfig[YearlyType.ORDINAL_WEEK],
                  ordinalWeekdays: value,
                },
              });
            }}
          />
        </div>
      )}
    </div>
  );
}
