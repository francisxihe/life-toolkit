import React, { useState } from 'react';
import { IconRefresh, IconMinusCircle } from '@arco-design/web-react/icon';
import NormalTimer from './normal';
import { MiniTimer } from './mini';
import styles from './style.module.less';
import clsx from 'clsx';
import { TimerProvider, useTimerContext } from './context';

const TimerContent: React.FC = () => {
  const {
    countdown,
    clockState,
    setClockState,
    clockRefresh,
    setClockRefresh,
    isMiniMode,
    toggleMiniMode,
    handleRefresh,
    onConfirmSetting,
  } = useTimerContext();

  if (isMiniMode) {
    return (
      <MiniTimer
        countdown={countdown}
        state={clockState}
        refresh={clockRefresh}
        setRefresh={setClockRefresh}
        onToggleMode={toggleMiniMode}
        onPlayPause={() => setClockState(!clockState)}
        onRefresh={handleRefresh}
      />
    );
  }

  return <NormalTimer />;
};

function Timer() {
  return (
    <TimerProvider>
      <TimerContent />
    </TimerProvider>
  );
}

export default Timer;
