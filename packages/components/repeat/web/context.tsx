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
import {
  OrdinalDay,
  OrdinalDayType,
} from "./ordinal-selector/OrdinalDaySelector";

export type RepeatContextProps = {
  value: RepeatModeForm & RepeatEndModeForm;
  onChange: (value: RepeatModeForm & RepeatEndModeForm) => void;
  children: React.ReactNode;
};

export const [RepeatProvider, useRepeatContext] = createInjectState<{
  PropsType: RepeatContextProps;
  ContextType: {
    t: Record<string, string>;
    repeatModeForm: RepeatModeForm;
    handleChangeRepeatMode: (repeatMode: RepeatMode) => void;
    handleChangeRepeatConfig: (config?: RepeatConfig) => void;
    repeatEndModeForm: RepeatEndModeForm;
    handleChangeRepeatEndMode: (repeatEndModeForm: RepeatEndModeForm) => void;
  };
}>((props) => {
  const { t } = useLocaleContext();

  const { onChange, value } = props;
  const [repeatModeForm, setRepeatModeForm] = useState<RepeatModeForm>({
    repeatMode: RepeatMode.CUSTOM,
    config: {
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
          config: { weekdays: [] },
        });
        break;
      case RepeatMode.MONTHLY:
        setRepeatModeForm({
          repeatMode: RepeatMode.MONTHLY,
          config: {
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
          config: {
            yearlyType: YearlyType.MONTH,
            month: { monthlyType: MonthlyType.DAY, [MonthlyType.DAY]: 1 },
          },
        });
        break;
      case RepeatMode.CUSTOM:
        setRepeatModeForm({
          repeatMode: RepeatMode.CUSTOM,
          config: { interval: 1, intervalUnit: TimeUnit.DAY },
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

  const handleChangeRepeatConfig = (config?: RepeatConfig) => {
    switch (repeatModeForm.repeatMode) {
      case RepeatMode.WEEKLY:
        setRepeatModeForm({
          repeatMode: RepeatMode.WEEKLY,
          config: config as RepeatFormWeekly["config"],
        });
        break;
      case RepeatMode.MONTHLY:
        setRepeatModeForm({
          repeatMode: RepeatMode.MONTHLY,
          config: config as RepeatFormMonthly["config"],
        });
        break;
      case RepeatMode.YEARLY:
        setRepeatModeForm({
          repeatMode: RepeatMode.YEARLY,
          config: config as RepeatFormYearly["config"],
        });
        break;
      case RepeatMode.CUSTOM:
        setRepeatModeForm({
          repeatMode: RepeatMode.CUSTOM,
          config: config as RepeatFormCustom["config"],
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
