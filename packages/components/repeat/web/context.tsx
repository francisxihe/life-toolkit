import {
  RepeatMode,
  RepeatModeForm,
  RepeatEndMode,
  RepeatEndModeForm,
  RepeatFormWeekly,
  RepeatFormMonthly,
  RepeatFormYearly,
  RepeatFormCustom,
  MonthlyType,
  RepeatConfig,
  TimeUnit,
  YearlyType,
} from "../types";
import { createInjectState } from "@life-toolkit/web-utils/src/createInjectState";
import { useState } from "react";
import { useLocaleContext } from "./useLocale";
import { OrdinalDay, OrdinalDayType } from "../types";

export type RepeatContextProps = {
  value?: RepeatModeForm & RepeatEndModeForm;
  onChange: (value: RepeatModeForm & RepeatEndModeForm) => void;
  children: React.ReactNode;
};

export const [RepeatProvider, useRepeatContext] = createInjectState<{
  PropsType: RepeatContextProps;
  ContextType: {
    t: Record<string, string>;
    repeatModeForm: RepeatModeForm;
    handleChangeRepeatMode: (repeatMode: RepeatMode) => void;
    handleChangeRepeatConfig: (repeatConfig?: RepeatConfig) => void;
    repeatEndModeForm: RepeatEndModeForm;
    handleChangeRepeatEndMode: (repeatEndModeForm: RepeatEndModeForm) => void;
  };
}>((props) => {
  const { t } = useLocaleContext();

  const { onChange, value } = props;
  const [repeatModeForm, setRepeatModeForm] = useState<RepeatModeForm>({
    repeatMode: RepeatMode.CUSTOM,
    repeatConfig: {
      interval: 1,
      intervalUnit: TimeUnit.MONTH,
      [TimeUnit.MONTH]: {
        monthlyType: MonthlyType.ORDINAL_DAY,
        [MonthlyType.ORDINAL_DAY]: {
          ordinalDay: OrdinalDay.FIRST,
          ordinalDayType: OrdinalDayType.DAY,
        },
      },
    },
  });
  const [repeatEndModeForm, setRepeatEndModeForm] = useState<RepeatEndModeForm>(
    {
      repeatEndMode: RepeatEndMode.FOREVER,
    }
  );

  const handleChangeRepeatMode = (repeatMode: RepeatMode) => {
    switch (repeatMode) {
      case RepeatMode.WEEKLY:
        setRepeatModeForm({
          repeatMode: RepeatMode.WEEKLY,
          repeatConfig: { weekdays: [] },
        });
        break;
      case RepeatMode.MONTHLY:
        setRepeatModeForm({
          repeatMode: RepeatMode.MONTHLY,
          repeatConfig: {
            monthlyType: MonthlyType.ORDINAL_DAY,
            [MonthlyType.ORDINAL_DAY]: {
              ordinalDay: OrdinalDay.FIRST,
              ordinalDayType: OrdinalDayType.DAY,
            },
          },
        });
        break;
      case RepeatMode.YEARLY:
        setRepeatModeForm({
          repeatMode: RepeatMode.YEARLY,
          repeatConfig: {
            yearlyType: YearlyType.MONTH,
            month: { monthlyType: MonthlyType.DAY, [MonthlyType.DAY]: 1 },
          },
        });
        break;
      case RepeatMode.CUSTOM:
        setRepeatModeForm({
          repeatMode: RepeatMode.CUSTOM,
          repeatConfig: { interval: 1, intervalUnit: TimeUnit.DAY },
        });
        break;
      default:
        setRepeatModeForm({
          repeatMode: repeatMode,
        });
    }
    onChange({
      ...repeatModeForm,
      ...repeatEndModeForm,
    });
  };

  const handleChangeRepeatConfig = (repeatConfig?: RepeatConfig) => {
    switch (repeatModeForm.repeatMode) {
      case RepeatMode.WEEKLY:
        setRepeatModeForm({
          repeatMode: RepeatMode.WEEKLY,
          repeatConfig: repeatConfig as RepeatFormWeekly["repeatConfig"],
        });
        break;
      case RepeatMode.MONTHLY:
        setRepeatModeForm({
          repeatMode: RepeatMode.MONTHLY,
          repeatConfig: repeatConfig as RepeatFormMonthly["repeatConfig"],
        });
        break;
      case RepeatMode.YEARLY:
        setRepeatModeForm({
          repeatMode: RepeatMode.YEARLY,
          repeatConfig: repeatConfig as RepeatFormYearly["repeatConfig"],
        });
        break;
      case RepeatMode.CUSTOM:
        setRepeatModeForm({
          repeatMode: RepeatMode.CUSTOM,
          repeatConfig: repeatConfig as RepeatFormCustom["repeatConfig"],
        });
        break;
      default:
        break;
    }
    onChange({
      ...repeatModeForm,
      ...repeatEndModeForm,
    });
  };

  const handleChangeRepeatEndMode = (repeatEndModeForm: RepeatEndModeForm) => {
    setRepeatEndModeForm(repeatEndModeForm);

    onChange({
      ...repeatModeForm,
      ...repeatEndModeForm,
    });
  };

  return {
    t,
    repeatModeForm,
    handleChangeRepeatMode,
    handleChangeRepeatConfig,
    repeatEndModeForm,
    handleChangeRepeatEndMode,
  };
});
