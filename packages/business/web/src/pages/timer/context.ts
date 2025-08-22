import { createInjectState } from '@/utils/createInjectState';
import { useState, useEffect } from 'react';

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
    isFullscreen: boolean;
    toggleFullscreen: () => void;
    handleRefresh: () => void;
    onConfirmSetting: (settingForm: any) => void;
  };
}>(() => {
  const [clockState, setClockState] = useState(false);
  const [countdown, setCountdown] = useState(1500);
  const [clockRefresh, setClockRefresh] = useState(false);
  const [form, setForm] = useState({ countdown: 1500 });
  const [isMiniMode, setIsMiniMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        // 进入全屏
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        // 退出全屏
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('全屏切换失败:', error);
    }
  };

  // 监听全屏状态变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

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
    isFullscreen,
    toggleFullscreen,
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
