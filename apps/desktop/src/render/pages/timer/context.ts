import { createInjectState } from '@/utils/createInjectState';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TrackTimeController } from '@true-north/web-service';
import { TrackTimeRelatedType } from '@true-north/enum';
import { message } from '@sue/design-web-react';

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
    relatedTaskId?: string;
    toggleFocus: () => void;
    discardFocus: () => void;
    completeFocus: () => void;
    finishFocus: () => Promise<void>;
    focusSeconds: number;
  };
}>(() => {
  const [searchParams] = useSearchParams();
  const relatedTaskId = searchParams.get('taskId') || undefined;
  const [clockState, setClockState] = useState(false);
  const [countdown, setCountdown] = useState(1500);
  const [clockRefresh, setClockRefresh] = useState(false);
  const [form, setForm] = useState({ countdown: 1500 });
  const [isMiniMode, setIsMiniMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [accumulatedSeconds, setAccumulatedSeconds] = useState(0);

  const handleRefresh = () => {
    setClockRefresh(true);
    setClockState(false);
    setCountdown(form.countdown);
    setStartedAt(null);
    setAccumulatedSeconds(0);
  };

  const onConfirmSetting = (settingForm: any): void => {
    setForm(settingForm);
    setCountdown(settingForm.countdown);
    setClockRefresh(true);
    setClockState(false);
    setStartedAt(null);
    setAccumulatedSeconds(0);
  };

  const pauseFocus = () => {
    if (startedAt) {
      setAccumulatedSeconds((value) => Math.min(
        form.countdown,
        value + Math.max(0, Math.floor((Date.now() - startedAt) / 1000)),
      ));
      setStartedAt(null);
    }
    setClockState(false);
  };

  const toggleFocus = () => {
    if (clockState) {
      pauseFocus();
      return;
    }
    if (accumulatedSeconds >= form.countdown) return;
    setStartedAt(Date.now());
    setClockState(true);
  };

  const completeFocus = () => {
    setAccumulatedSeconds(form.countdown);
    setStartedAt(null);
    setClockState(false);
  };

  const discardFocus = () => {
    setStartedAt(null);
    setAccumulatedSeconds(0);
    setClockState(false);
    setClockRefresh(true);
    setCountdown(form.countdown);
  };

  const finishFocus = async () => {
    const duration = Math.min(
      form.countdown,
      accumulatedSeconds + (startedAt ? Math.max(0, Math.floor((Date.now() - startedAt) / 1000)) : 0),
    );
    if (!duration) {
      message.error('请先开始专注再记录');
      return;
    }
    const endAt = new Date();
    await TrackTimeController.create({
      relatedType: relatedTaskId ? TrackTimeRelatedType.TASK : TrackTimeRelatedType.NONE,
      relatedId: relatedTaskId,
      startAt: new Date(endAt.getTime() - duration * 1000).toISOString(),
      endAt: endAt.toISOString(),
      duration,
    });
    message.success('专注记录已保存');
    discardFocus();
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
    relatedTaskId,
    toggleFocus,
    discardFocus,
    completeFocus,
    finishFocus,
    focusSeconds: Math.min(
      form.countdown,
      accumulatedSeconds + (startedAt ? Math.max(0, Math.floor((Date.now() - startedAt) / 1000)) : 0),
    ),
  };
});

export const useTimerContext = () => {
  const context = _useTimerContext();
  if (!context) {
    throw new Error('TimerContext not found');
  }
  return context;
};
