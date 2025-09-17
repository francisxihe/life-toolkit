import { WeekDay, Month } from '@life-toolkit/service-repeat-types';

export const WeekDayMap = new Map<WeekDay, string>([
  [WeekDay.MONDAY, 'monday'],
  [WeekDay.TUESDAY, 'tuesday'],
  [WeekDay.WEDNESDAY, 'wednesday'],
  [WeekDay.THURSDAY, 'thursday'],
  [WeekDay.FRIDAY, 'friday'],
  [WeekDay.SATURDAY, 'saturday'],
  [WeekDay.SUNDAY, 'sunday'],
]);

export const MonthMap = new Map<Month, string>([
  [Month.JANUARY, 'january'],
  [Month.FEBRUARY, 'february'],
  [Month.MARCH, 'march'],
  [Month.APRIL, 'april'],
  [Month.MAY, 'may'],
  [Month.JUNE, 'june'],
  [Month.JULY, 'july'],
  [Month.AUGUST, 'august'],
  [Month.SEPTEMBER, 'september'],
  [Month.OCTOBER, 'october'],
  [Month.NOVEMBER, 'november'],
  [Month.DECEMBER, 'december'],
]);
