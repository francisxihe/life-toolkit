import React, { useState } from 'react';
import { IconRefresh } from '@arco-design/web-react/icon';
import { Countdown as ClockCountdown } from './components/clock';
import { PlayController, Setting } from './components/actions';
import './index.css';

const Timer: React.FC = () => {
  const [clockState, setClockState] = useState(false);
  const [countdown, setCountdown] = useState(1500);
  const [clockRefresh, setClockRefresh] = useState(false);
  const [form, setForm] = useState({ countdown: 1500 });

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

  return (
    <>
      <div className="clock">
        <ClockCountdown
          refresh={clockRefresh}
          setRefresh={setClockRefresh}
          countdown={countdown}
          state={clockState}
        />
      </div>
      <div className="actions">
        <PlayController
          className="action action-play"
          state={clockState}
          setState={setClockState}
        />
        <IconRefresh
          className="action action-reload"
          onClick={handleRefresh}
          style={{ color: '#fff', fontSize: '30px' }}
        />
        <Setting
          className="action action-setting"
          onConfirm={onConfirmSetting}
        />
      </div>
    </>
  );
};

export default Timer;
