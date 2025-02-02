import { Calendar } from '@arco-design/web-react';
import SearchBar from './SearchBar';
import { CalendarProvider } from './context';
import CalendarCell from './CalendarCell';
import { useCalendarContext } from './context';
import PanelHeader from './CalendarHeader';
import styles from './style.module.less';

function CalendarPage() {
  const { pageShowDate, calendarMode } = useCalendarContext();

  return (
    <div className="bg-bg-2 rounded-lg w-full max-h-full">
      <SearchBar />
      <Calendar
        className={`${styles['custom-calendar']}`}
        pageShowDate={pageShowDate}
        mode={calendarMode}
        dateRender={(date) => <CalendarCell cellDate={date} />}
        headerRender={() => (
          <PanelHeader prefixCls="arco-calendar"></PanelHeader>
        )}
      />

      {/* <TodoEditorDrawer
        visible={drawerVisible}
        todo={currentTodo}
        onCancel={async () => {
          setDrawerVisible(false);
          await getTodoList();
          if (subTodoLoadingStatus[currentTodo.id] === 'loaded') {
            onExpandTable(currentTodo, true);
          }
        }}
      /> */}
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
