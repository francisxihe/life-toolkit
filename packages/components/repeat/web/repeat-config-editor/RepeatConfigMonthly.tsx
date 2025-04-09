import { Radio, Calendar } from '@arco-design/web-react';
import { RepeatFormMonthly, MonthlyType, WeekDay } from '../../types';
import OrdinalDaySelector, {
  OrdinalDayType,
  OrdinalDay,
} from '../ordinal-selector/OrdinalDaySelector';
import OrdinalWeekDaysSelector, {
  OrdinalWeek,
} from '../ordinal-selector/OrdinalWeekDaysSelector';
import dayjs from 'dayjs';

export default function RepeatConfigMonthly(props: {
  config: RepeatFormMonthly['config'];
  handleConfigChange: (config: RepeatFormMonthly['config']) => void;
}) {
  const { config: monthlyConfig, handleConfigChange } = props;

  return (
    <div className="flex flex-col gap-4">
      <Radio.Group
        className="w-full"
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
        <Calendar
          className="!w-full"
          panel
          headerRender={() => null}
          style={{ marginRight: 50 }}
          defaultValue={dayjs()}
          disabledDate={(date) => {
            return (
              date.isAfter(dayjs(), 'month') || date.isBefore(dayjs(), 'month')
            );
          }}
          onChange={(date) => {
            handleConfigChange({
              ...monthlyConfig,
              [MonthlyType.DAY]: date.daysInMonth(),
            });
          }}
        />
      )}

      {monthlyConfig.monthlyType === MonthlyType.ORDINAL_WEEK && (
        <div className="flex items-center gap-2">
          <div className="text-sm flex-shrink-0">每月</div>
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
            ordinalWeekDays={
              monthlyConfig[MonthlyType.ORDINAL_WEEK].ordinalWeekdays
            }
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
