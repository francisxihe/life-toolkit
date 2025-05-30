import React, { useState } from 'react';
import {
  IconRefresh,
  IconMinusCircle,
} from '@arco-design/web-react/icon';
import { Countdown as ClockCountdown } from './normal';
import { PlayController, Setting } from './components/actions';
import { MiniTimer } from './mini';
import styles from './style.module.less';
import clsx from 'clsx';
import { TimerProvider, useTimerContext } from './context';

const TimerContent: React.FC = () => {
  const {
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

  return (
    <>
      <div className={styles['clock']}>
        <ClockCountdown
          refresh={clockRefresh}
          setRefresh={setClockRefresh}
          countdown={countdown}
          state={clockState}
        />
      </div>
      <div className={styles['actions']}>
        <PlayController
          className={clsx(styles['action'], 'action-play')}
          state={clockState}
          setState={setClockState}
        />
        <IconRefresh
          className={clsx(styles['action'], 'action-reload')}
          onClick={handleRefresh}
          style={{ color: '#fff', fontSize: '30px' }}
        />
        <Setting
          className={clsx(styles['action'], 'action-setting')}
          onConfirm={onConfirmSetting}
        />
        <IconMinusCircle
          className={clsx(styles['action'], 'action-mini')}
          onClick={toggleMiniMode}
          style={{ color: '#fff', fontSize: '30px' }}
        />
      </div>
    </>
  );
};

function Timer() {
  return (
    <TimerProvider>
      <TimerContent />
    </TimerProvider>
  );
}

export default Timer;
