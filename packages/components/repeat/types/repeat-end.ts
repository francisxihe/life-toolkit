import { Dayjs } from 'dayjs';

export enum RepeatEndMode {
  FOREVER = 'forever',
  FOR_TIMES = 'forTimes',
  TO_DATE = 'toDate',
}

type RepeatFormForever = {
  repeatEndMode: RepeatEndMode.FOREVER;
};

type RepeatFormForTimes = {
  repeatEndMode: RepeatEndMode.FOR_TIMES;
  repeatTimes: number;
};

type RepeatFormToDate = {
  repeatEndMode: RepeatEndMode.TO_DATE;
  repeatEndDate: Dayjs;
};

export type RepeatEndModeForm =
  | RepeatFormForever
  | RepeatFormForTimes
  | RepeatFormToDate;
