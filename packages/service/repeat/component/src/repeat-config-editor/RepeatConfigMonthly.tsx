import { Radio, Calendar, Select } from '@arco-design/web-react';
import { RepeatFormMonthly, MonthlyType, WeekDay } from '@life-toolkit/service-repeat-types';
import { OrdinalDaySelector, OrdinalWeekDaysSelector } from '../ordinal-selector';
import { OrdinalWeek, OrdinalDay, OrdinalDayType } from '@life-toolkit/service-repeat-types';

export default function RepeatConfigMonthly(props: {
  repeatConfig: RepeatFormMonthly['repeatConfig'];
  handleConfigChange: (repeatConfig: RepeatFormMonthly['repeatConfig']) => void;
}) {
  const { repeatConfig: monthlyConfig, handleConfigChange } = props;

  return (
    <div className={'repeat__vertical-container-sm'}>
      <Radio.Group
        className={'repeat__radio-group'}
        type="button"
        value={monthlyConfig.monthlyType || MonthlyType.DAY}
        onChange={(value) => {
          switch (value) {
            case MonthlyType.DAY:
              handleConfigChange({
                monthlyType: MonthlyType.DAY,
                [MonthlyType.DAY]: 1,
              });
              break;
            case MonthlyType.ORDINAL_WEEK:
              handleConfigChange({
                monthlyType: MonthlyType.ORDINAL_WEEK,
                [MonthlyType.ORDINAL_WEEK]: {
                  ordinalWeek: OrdinalWeek.FIRST,
                  ordinalWeekdays: [WeekDay.MONDAY],
                },
              });
              break;
            case MonthlyType.ORDINAL_DAY:
              handleConfigChange({
                monthlyType: MonthlyType.ORDINAL_DAY,
                [MonthlyType.ORDINAL_DAY]: {
                  ordinalDay: OrdinalDay.FIRST,
                  ordinalDayType: OrdinalDayType.DAY,
                },
              });
              break;
            default:
              break;
          }
        }}
      >
        <Radio value={MonthlyType.DAY}>按日期</Radio>
        <Radio value={MonthlyType.ORDINAL_WEEK}>按星期</Radio>
        <Radio value={MonthlyType.ORDINAL_DAY}>按序号</Radio>
      </Radio.Group>

      {monthlyConfig.monthlyType === MonthlyType.DAY && (
        <Select
          className={'repeat__select'}
          mode="multiple"
          value={monthlyConfig[MonthlyType.DAY]}
          options={Array.from({ length: 31 }, (_, index) => index + 1).map((value) => ({
            value: value.toString(),
            label: `${value.toString()}日`,
          }))}
          placeholder="选择日期"
          onChange={(value) => {
            handleConfigChange({
              ...monthlyConfig,
              [MonthlyType.DAY]: value,
            });
          }}
        />
      )}

      {monthlyConfig.monthlyType === MonthlyType.ORDINAL_WEEK && (
        <div className={'repeat__horizontal-container'}>
          <div className={'repeat__label'}>每月</div>
          <OrdinalWeekDaysSelector
            ordinal={monthlyConfig[MonthlyType.ORDINAL_WEEK].ordinalWeek}
            setOrdinal={(value) =>
              handleConfigChange({
                ...monthlyConfig,
                [MonthlyType.ORDINAL_WEEK]: {
                  ...monthlyConfig[MonthlyType.ORDINAL_WEEK],
                  ordinalWeek: value,
                },
              })
            }
            ordinalWeekDays={monthlyConfig[MonthlyType.ORDINAL_WEEK].ordinalWeekdays}
            setOrdinalWeekDays={(value) =>
              handleConfigChange({
                ...monthlyConfig,
                [MonthlyType.ORDINAL_WEEK]: {
                  ...monthlyConfig[MonthlyType.ORDINAL_WEEK],
                  ordinalWeekdays: value,
                },
              })
            }
          />
        </div>
      )}

      {monthlyConfig.monthlyType === MonthlyType.ORDINAL_DAY && (
        <OrdinalDaySelector
          ordinal={monthlyConfig[MonthlyType.ORDINAL_DAY].ordinalDay}
          setOrdinal={(value) => {
            return handleConfigChange({
              ...monthlyConfig,
              [MonthlyType.ORDINAL_DAY]: {
                ...monthlyConfig[MonthlyType.ORDINAL_DAY],
                ordinalDay: value,
              },
            });
          }}
          ordinalDayType={monthlyConfig[MonthlyType.ORDINAL_DAY].ordinalDayType}
          setOrdinalDayType={(value) => {
            return handleConfigChange({
              ...monthlyConfig,
              [MonthlyType.ORDINAL_DAY]: {
                ...monthlyConfig[MonthlyType.ORDINAL_DAY],
                ordinalDayType: value,
              },
            });
          }}
        />
      )}
    </div>
  );
}
