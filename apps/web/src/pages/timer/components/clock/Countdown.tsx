import React, { useEffect, useState, useRef } from 'react';
import FlipItem from './Flip';
import { getTimeArr } from './utils';
import './Countdown.css';

interface CountdownProps {
  countdown: number;
  state: boolean;
  refresh: boolean;
  setRefresh: (refresh: boolean) => void;
}

const Countdown: React.FC<CountdownProps> = ({ countdown, state, refresh, setRefresh }) => {
  const [nCountdown, setNCountdown] = useState<number>(countdown);
  const [timeArr, setTimeArr] = useState<number[]>(getTimeArr(nCountdown));
  const timeHandleRef = useRef<NodeJS.Timeout | null>(null);
  const timeMarkRef = useRef<Date | null>(null);

  const startTimer = () => {
    if (timeHandleRef.current) stopTimer();
    if (nCountdown <= 0) {
      setNCountdown(0);
      return;
    }
    timeMarkRef.current = new Date();
    timeHandleRef.current = setTimeout(() => {
      const diffTime = new Date().getTime() - (timeMarkRef.current?.getTime() || 0);
      const newCountdown = nCountdown - Math.floor(diffTime / 1000);
      setNCountdown(newCountdown < 0 ? 0 : newCountdown);
      setTimeArr(getTimeArr(newCountdown < 0 ? 0 : newCountdown));
      startTimer();
    }, 1000);
  };

  const stopTimer = () => {
    if (timeHandleRef.current) {
      clearTimeout(timeHandleRef.current);
      timeHandleRef.current = null;
    }
  };

  const handleLoadClock = () => {
    setNCountdown(countdown);
    setTimeArr(getTimeArr(countdown));
    if (state === true) {
      startTimer();
    }
  };

  useEffect(() => {
    if (state === true) {
      if (!timeHandleRef.current) startTimer();
    }
    if (state === false) {
      if (timeHandleRef.current) stopTimer();
    }
  }, [state]);

  useEffect(() => {
    handleLoadClock();
  }, [countdown]);

  useEffect(() => {
    if (refresh) {
      handleLoadClock();
      setRefresh(false);
    }
  }, [refresh]);

  useEffect(() => {
    return () => {
      stopTimer();
    };
  }, []);

  return (
    <div className="clock-container">
      <FlipItem total={2} current={timeArr[0]} />
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