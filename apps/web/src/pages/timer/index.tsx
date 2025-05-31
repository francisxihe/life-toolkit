import React from 'react';
import NormalTimer from './normal';
import { MiniTimer } from './mini';
import { TimerProvider, useTimerContext } from './context';

const TimerContent: React.FC = () => {
  const { isMiniMode } = useTimerContext();

  if (isMiniMode) {
    return <MiniTimer />;
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
