import { Radio, Select } from '@arco-design/web-react';
import { RepeatFormYearly, YearlyType, MonthlyType, WeekDay, OrdinalWeek } from '@life-toolkit/service-repeat-types';
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
                month: {
                  monthlyType: MonthlyType.DAY,
                  [MonthlyType.DAY]: 1,
                  month: [],
                },
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
        <>
          <Select
            className={'repeat__select'}
            mode="multiple"
            value={yearlyConfig[YearlyType.MONTH].month}
            options={Array.from({ length: 12 }, (_, index) => index + 1).map((value) => ({
              value: value.toString(),
              label: `${value.toString()}月`,
            }))}
            placeholder="选择月份"
            onChange={(value) => {
              handleConfigChange({
                yearlyType: YearlyType.MONTH,
                [YearlyType.MONTH]: {
                  ...yearlyConfig[YearlyType.MONTH],
                  month: value,
                },
              });
            }}
          />
          <RepeatConfigMonthly
            repeatConfig={yearlyConfig[YearlyType.MONTH]}
            handleConfigChange={(monthlyConfig) => {
              handleConfigChange({
                yearlyType: YearlyType.MONTH,
                [YearlyType.MONTH]: {
                  ...yearlyConfig[YearlyType.MONTH],
                  ...monthlyConfig,
                },
              });
            }}
          />
        </>
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
