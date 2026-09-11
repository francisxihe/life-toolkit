import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import dayjs, { type Dayjs } from 'dayjs';

type AgendaDateValue = {
  selectedDate: Dayjs;
  setSelectedDate: Dispatch<SetStateAction<Dayjs>>;
  visibleMonth: Dayjs;
  setVisibleMonth: Dispatch<SetStateAction<Dayjs>>;
};

const AgendaDateContext = createContext<AgendaDateValue | null>(null);

export function AgendaProvider({ children }: { children: ReactNode }) {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(() => dayjs());
  const [visibleMonth, setVisibleMonth] = useState<Dayjs>(() => dayjs().startOf('month'));

  return (
    <AgendaDateContext.Provider value={{ selectedDate, setSelectedDate, visibleMonth, setVisibleMonth }}>
      {children}
    </AgendaDateContext.Provider>
  );
}

export function useAgendaDate() {
  const context = useContext(AgendaDateContext);

  if (!context) {
    throw new Error('useAgendaDate must be used within AgendaProvider');
  }

  return context;
}
