import { useMemo } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TODAY } from '../mock-data';
import styles from './DayAgendaCalendar.module.css';

type DayAgendaCalendarProps = {
  value: Dayjs;
  onChange: (date: Dayjs) => void;
  visibleMonth: Dayjs;
  onVisibleMonthChange: (month: Dayjs) => void;
  itemCounts: Record<string, number>;
  /** Prototype demo date used as “今天” */
  today?: string;
};

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export function DayAgendaCalendar({
  value,
  onChange,
  visibleMonth,
  onVisibleMonthChange,
  itemCounts,
  today = TODAY,
}: DayAgendaCalendarProps) {
  const todayDate = dayjs(today);
  const dates = useMemo(() => {
    const visibleStart = visibleMonth.startOf('month').startOf('week');
    const visibleEnd = visibleMonth.endOf('month').endOf('week');
    const dateCount = visibleEnd.diff(visibleStart, 'day') + 1;
    return Array.from({ length: dateCount }, (_, index) => visibleStart.add(index, 'day'));
  }, [visibleMonth]);

  const selectToday = () => {
    onVisibleMonthChange(todayDate.startOf('month'));
    onChange(todayDate);
  };

  const selectDate = (date: Dayjs) => {
    onVisibleMonthChange(date.startOf('month'));
    onChange(date);
  };

  return (
    <section className={styles.calendar} aria-label="日期选择">
      <header className={styles.header}>
        <button
          className={styles.iconButton}
          type="button"
          title="上个月"
          aria-label="上个月"
          onClick={() => onVisibleMonthChange(visibleMonth.subtract(1, 'month'))}
        >
          <ChevronLeft size={16} />
        </button>
        <span className={styles.monthLabel}>{visibleMonth.format('YYYY年M月')}</span>
        <button
          className={styles.iconButton}
          type="button"
          title="下个月"
          aria-label="下个月"
          onClick={() => onVisibleMonthChange(visibleMonth.add(1, 'month'))}
        >
          <ChevronRight size={16} />
        </button>
      </header>

      <div className={styles.weekdays} aria-hidden="true">
        {WEEKDAYS.map((weekday) => (
          <span key={weekday}>{weekday}</span>
        ))}
      </div>

      <div className={styles.dates}>
        {dates.map((date) => {
          const isToday = date.isSame(todayDate, 'day');
          const isSelected = date.isSame(value, 'day');
          const isOutsideMonth = !date.isSame(visibleMonth, 'month');
          const itemCount = itemCounts[date.format('YYYY-MM-DD')] || 0;
          const className = [
            styles.dateButton,
            isToday ? styles.today : '',
            isSelected ? styles.selected : '',
            isOutsideMonth ? styles.outsideMonth : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <button
              key={date.format('YYYY-MM-DD')}
              type="button"
              className={className}
              aria-label={date.format('YYYY年M月D日')}
              aria-pressed={isSelected}
              onClick={() => selectDate(date)}
            >
              <span className={styles.dateNumber}>{date.date()}</span>
              {itemCount > 0 && <span className={styles.itemCount}>{itemCount}</span>}
            </button>
          );
        })}
      </div>

      <button className={styles.todayButton} type="button" onClick={selectToday}>
        今天
      </button>
    </section>
  );
}

export function formatDayAgendaTitle(date: Dayjs, today = TODAY) {
  const todayDate = dayjs(today);
  if (date.isSame(todayDate, 'day')) return '今天';
  if (date.isSame(todayDate.subtract(1, 'day'), 'day')) return '昨天';
  if (date.isSame(todayDate.add(1, 'day'), 'day')) return '明天';
  if (date.isSame(todayDate, 'week')) return date.format('dddd');
  return date.format('YYYY年M月D日 dddd');
}
