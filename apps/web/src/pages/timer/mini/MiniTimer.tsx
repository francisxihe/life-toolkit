import React, { useEffect, useState, useRef, useCallback } from 'react';
import { IconPlayCircle, IconPauseCircle, IconRefresh, IconPlusCircle } from '@arco-design/web-react/icon';
import { getTimeArr } from '../utils';
import styles from './MiniTimer.module.css';

interface MiniTimerProps {
  countdown: number;
  state: boolean;
  refresh: boolean;
  setRefresh: (refresh: boolean) => void;
  onToggleMode: () => void;
  onPlayPause: () => void;
  onRefresh: () => void;
}

const MiniTimer: React.FC<MiniTimerProps> = ({
  countdown,
  state,
  refresh,
  setRefresh,
  onToggleMode,
  onPlayPause,
  onRefresh
}) => {
  const [nCountdown, setNCountdown] = useState<number>(countdown);
  const [timeArr, setTimeArr] = useState<number[]>(getTimeArr(countdown));
  const timeHandleRef = useRef<NodeJS.Timeout | null>(null);
  const timeMarkRef = useRef<Date | null>(null);
  const nCountdownRef = useRef<number>(countdown);

  // 同步ref值
  useEffect(() => {
    nCountdownRef.current = nCountdown;
  }, [nCountdown]);

  const stopTimer = useCallback(() => {
    if (timeHandleRef.current) {
      clearTimeout(timeHandleRef.current);
      timeHandleRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    const tick = () => {
      if (timeHandleRef.current) {
        clearTimeout(timeHandleRef.current);
      }
      
      const currentCountdown = nCountdownRef.current;
      if (currentCountdown <= 0) {
        setNCountdown(0);
        setTimeArr(getTimeArr(0));
        timeHandleRef.current = null;
        return;
      }

      timeMarkRef.current = new Date();
      timeHandleRef.current = setTimeout(() => {
        const diffTime = new Date().getTime() - (timeMarkRef.current?.getTime() || 0);
        const newCountdown = currentCountdown - Math.floor(diffTime / 1000);
        const finalCountdown = Math.max(0, newCountdown);
        
        setNCountdown(finalCountdown);
        setTimeArr(getTimeArr(finalCountdown));
        
        if (finalCountdown > 0) {
          tick();
        } else {
          timeHandleRef.current = null;
        }
      }, 1000);
    };

    tick();
  }, []);

  const handleLoadClock = useCallback(() => {
    setNCountdown(countdown);
    setTimeArr(getTimeArr(countdown));
  }, [countdown]);

  useEffect(() => {
    if (state === true) {
      if (!timeHandleRef.current && nCountdown > 0) {
        startTimer();
      }
    } else {
      stopTimer();
    }
  }, [state, startTimer, stopTimer]);

  useEffect(() => {
    handleLoadClock();
  }, [handleLoadClock]);

  useEffect(() => {
    if (refresh) {
      handleLoadClock();
      setRefresh(false);
    }
  }, [refresh, handleLoadClock, setRefresh]);

  useEffect(() => {
    return () => {
      stopTimer();
    };
  }, [stopTimer]);

  const formatTime = (timeArray: number[]) => {
    const minutes = timeArray[0] * 10 + timeArray[1];
    const seconds = timeArray[2] * 10 + timeArray[3];
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles["mini-timer"]}>
      <div className={styles["mini-timer-content"]}>
        <div className={styles["mini-time-display"]}>
          {formatTime(timeArr)}
        </div>
        <div className={styles["mini-controls"]}>
          <button className={styles["mini-btn"]} onClick={onPlayPause}>
            {state ? <IconPauseCircle /> : <IconPlayCircle />}
          </button>
          <button className={styles["mini-btn"]} onClick={onRefresh}>
            <IconRefresh />
          </button>
          <button className={styles["mini-btn"]} onClick={onToggleMode}>
            <IconPlusCircle />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MiniTimer; 