import React, { useEffect, useState, useRef, useCallback } from 'react';
import FlipItem from './Flip';
import { getTimeArr } from '../utils';
import './Countdown.css';

interface CountdownProps {
  countdown: number;
  state: boolean;
  refresh: boolean;
  setRefresh: (refresh: boolean) => void;
}

const Countdown: React.FC<CountdownProps> = ({ countdown, state, refresh, setRefresh }) => {
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
          tick(); // 递归调用
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

  return (
    <div className="clock-container">
      <FlipItem total={9} current={timeArr[0]} />
      <FlipItem total={9} current={timeArr[1]} />
      <div className="colon"></div>
      <FlipItem total={5} current={timeArr[2]} />
      <FlipItem total={9} current={timeArr[3]} />
      <div className="colon"></div>
      <FlipItem total={5} current={timeArr[4]} />
      <FlipItem total={9} current={timeArr[5]} />
    </div>
  );
};

export default Countdown; 