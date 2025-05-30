import { createInjectState } from '@/utils/createInjectState';
import { useState } from 'react';

export const [TimerProvider, _useTimerContext] = createInjectState<{
  ContextType: {
    countdown: number;
    setCountdown: (countdown: number) => void;
    clockState: boolean;
    setClockState: (clockState: boolean) => void;
    clockRefresh: boolean;
    setClockRefresh: (clockRefresh: boolean) => void;
    form: { countdown: number };
    setForm: (form: { countdown: number }) => void;
    isMiniMode: boolean;
    toggleMiniMode: () => void;
    handleRefresh: () => void;
    onConfirmSetting: (settingForm: any) => void;
  };
}>(() => {
  const [clockState, setClockState] = useState(false);
  const [countdown, setCountdown] = useState(1500);
  const [clockRefresh, setClockRefresh] = useState(false);
  const [form, setForm] = useState({ countdown: 1500 });
  const [isMiniMode, setIsMiniMode] = useState(false);

  const handleRefresh = () => {
    setClockRefresh(true);
    setClockState(false);
    setCountdown(form.countdown);
  };

  const onConfirmSetting = (settingForm: any): void => {
    setForm(settingForm);
    setCountdown(settingForm.countdown);
    setClockRefresh(true);
    setClockState(false);
  };

  const toggleMiniMode = () => {
    setIsMiniMode(!isMiniMode);
  };

  return {
    countdown,
    setCountdown,
    clockState,
    setClockState,
    clockRefresh,
    setClockRefresh,
    form,
    setForm,
    isMiniMode,
    toggleMiniMode,
    handleRefresh,
    onConfirmSetting,
  };
});

export const useTimerContext = () => {
  const context = _useTimerContext();
  if (!context) {
    throw new Error('TimerContext not found');
  }
  return context;
};
