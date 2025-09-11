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
  OrdinalDay,
  OrdinalDayType,
} from '../../types';
import { createInjectState } from '@life-toolkit/common-web-utils/src/createInjectState';
import { useRef, useState } from 'react';
import { useLocaleContext } from './useLocale';

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

  const [repeatModeForm, setRepeatModeForm] = useState<RepeatModeForm>(
    (value as RepeatModeForm) || {
      repeatMode: RepeatMode.NONE,
    }
  );
  const [repeatEndModeForm, setRepeatEndModeForm] = useState<RepeatEndModeForm>({
    repeatEndMode: RepeatEndMode.FOREVER,
  });

  const repeatModeFormRef = useRef<RepeatModeForm>(repeatModeForm);
  const repeatEndModeFormRef = useRef<RepeatEndModeForm>(repeatEndModeForm);

  const handleChangeRepeatMode = (repeatMode: RepeatMode) => {
    switch (repeatMode) {
      case RepeatMode.WEEKLY:
        repeatModeFormRef.current = {
          repeatMode: RepeatMode.WEEKLY,
          repeatConfig: { weekdays: [] },
        };
        break;
      case RepeatMode.MONTHLY:
        repeatModeFormRef.current = {
          repeatMode: RepeatMode.MONTHLY,
          repeatConfig: {
            monthlyType: MonthlyType.ORDINAL_DAY,
            [MonthlyType.ORDINAL_DAY]: {
              ordinalDay: OrdinalDay.FIRST,
              ordinalDayType: OrdinalDayType.DAY,
            },
          },
        };
        break;
      case RepeatMode.YEARLY:
        repeatModeFormRef.current = {
          repeatMode: RepeatMode.YEARLY,
          repeatConfig: {
            yearlyType: YearlyType.MONTH,
            month: { monthlyType: MonthlyType.DAY, [MonthlyType.DAY]: 1 },
          },
        };
        break;
      case RepeatMode.CUSTOM:
        repeatModeFormRef.current = {
          repeatMode: RepeatMode.CUSTOM,
          repeatConfig: { interval: 1, intervalUnit: TimeUnit.DAY },
        };
        break;
      default:
        repeatModeFormRef.current = {
          repeatMode: repeatMode,
        };
    }

    setRepeatModeForm(repeatModeFormRef.current);

    onChange({
      ...repeatModeFormRef.current,
      ...repeatEndModeFormRef.current,
    });
  };

  const handleChangeRepeatConfig = (repeatConfig?: RepeatConfig) => {
    switch (repeatModeForm.repeatMode) {
      case RepeatMode.WEEKLY:
        repeatModeFormRef.current = {
          repeatMode: RepeatMode.WEEKLY,
          repeatConfig: repeatConfig as RepeatFormWeekly['repeatConfig'],
        };
        break;
      case RepeatMode.MONTHLY:
        repeatModeFormRef.current = {
          repeatMode: RepeatMode.MONTHLY,
          repeatConfig: repeatConfig as RepeatFormMonthly['repeatConfig'],
        };
        break;
      case RepeatMode.YEARLY:
        repeatModeFormRef.current = {
          repeatMode: RepeatMode.YEARLY,
          repeatConfig: repeatConfig as RepeatFormYearly['repeatConfig'],
        };
        break;
      case RepeatMode.CUSTOM:
        repeatModeFormRef.current = {
          repeatMode: RepeatMode.CUSTOM,
          repeatConfig: repeatConfig as RepeatFormCustom['repeatConfig'],
        };
        break;
      default:
        break;
    }

    setRepeatModeForm(repeatModeFormRef.current);

    onChange({
      ...repeatModeFormRef.current,
      ...repeatEndModeFormRef.current,
    });
  };

  const handleChangeRepeatEndMode = (repeatEndModeForm: RepeatEndModeForm) => {
    repeatEndModeFormRef.current = repeatEndModeForm;
    console.log('repeatEndModeForm', repeatEndModeForm);
    setRepeatEndModeForm(repeatEndModeFormRef.current);

    onChange({
      ...repeatModeFormRef.current,
      ...repeatEndModeFormRef.current,
    });
  };

  console.log('repeatModeForm', repeatModeForm);

  return {
    t,
    repeatModeForm,
    repeatEndModeForm,
    handleChangeRepeatMode,
    handleChangeRepeatConfig,
    handleChangeRepeatEndMode,
  };
});
