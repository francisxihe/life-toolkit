import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import dayjs, { type Dayjs } from 'dayjs';

type DayAgendaDateContextValue = {
  selectedDate: Dayjs;
  setSelectedDate: Dispatch<SetStateAction<Dayjs>>;
  visibleMonth: Dayjs;
  setVisibleMonth: Dispatch<SetStateAction<Dayjs>>;
};

const DayAgendaDateContext = createContext<DayAgendaDateContextValue | null>(null);

export function DayAgendaDateProvider({ children }: { children: ReactNode }) {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(() => dayjs());
  const [visibleMonth, setVisibleMonth] = useState<Dayjs>(() => dayjs().startOf('month'));

  return (
    <DayAgendaDateContext.Provider value={{ selectedDate, setSelectedDate, visibleMonth, setVisibleMonth }}>
      {children}
    </DayAgendaDateContext.Provider>
  );
}

export function useDayAgendaDate() {
  const context = useContext(DayAgendaDateContext);

  if (!context) {
    throw new Error('useDayAgendaDate must be used within DayAgendaDateProvider');
  }

  return context;
}
