import Countdown from './Countdown';
import Flip from './Flip';
import { getTimeArr } from '../utils';
import { PlayController, Setting } from '../actions';
import { useTimerContext } from '../context';
import styles from '../style.module.less';
import clsx from 'clsx';
import { IconRefresh, IconMinusCircle } from '@arco-design/web-react/icon';

export { Countdown, Flip, getTimeArr };

const NormalTimer: React.FC = () => {
    const {
      countdown,
      clockState,
      setClockState,
      clockRefresh,
      setClockRefresh,
      toggleMiniMode,
      handleRefresh,
      onConfirmSetting,
    } = useTimerContext();
  
    return (
      <>
        <div className={styles['clock']}>
          <Countdown
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
  
export default NormalTimer; 