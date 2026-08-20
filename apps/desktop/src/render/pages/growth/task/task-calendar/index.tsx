import { Calendar } from '@sue/design-web-react';
import { useEffect } from 'react';
import { CalendarProvider } from './context';
import CalendarCell from './CalendarCell';
import { useCalendarContext } from './context';
import PanelHeader from './CalendarHeader';
import styles from './style.module.less';
import { onTaskChanged } from '../../events';

function CalendarPage() {
  const {
    pageShowDate,
    setPageShowDate,
    getTaskList,
  } = useCalendarContext();

  useEffect(() => {
    void getTaskList(pageShowDate);
  }, [pageShowDate]);

  useEffect(() => onTaskChanged(() => {
    void getTaskList();
  }), [getTaskList]);

  return (
    <div className={styles.page}>
      <Calendar
        className={`${styles['custom-calendar']}`}
        value={pageShowDate}
        mode="month"
        fullCellRender={(date, info) =>
          info.type === 'date'
            ? <CalendarCell cellDate={date} />
            : info.originNode
        }
        headerRender={(config) => <PanelHeader {...config} />}
        onChange={setPageShowDate}
      />
    </div>
  );
}

export default function CalendarPageLayout() {
  return (
    <CalendarProvider>
      <CalendarPage />
    </CalendarProvider>
  );
}
