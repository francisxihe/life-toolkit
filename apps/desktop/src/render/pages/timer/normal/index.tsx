import { FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons';
import { Flex, MinusCircleOutlined, ReloadOutlined } from '@sue/design-web-react';
import Countdown from './Countdown';
import Flip from './Flip';
import { getTimeArr } from '../utils';
import { PlayController, Setting } from '../actions';
import { useTimerContext } from '../context';
import styles from '../style.module.less';
import clsx from 'clsx';

export { Countdown, Flip, getTimeArr };

const NormalTimer: React.FC = () => {
  const {
    countdown,
    clockState,
    clockRefresh,
    setClockRefresh,
    toggleMiniMode,
    isFullscreen,
    toggleFullscreen,
    handleRefresh,
    onConfirmSetting,
    relatedTaskId,
    toggleFocus,
    completeFocus,
    finishFocus,
  } = useTimerContext();

  return (
    <>
      <Flex className={styles['clock']} justify="center" align="center">
        {relatedTaskId && <div className="text-white text-center mb-2">关联任务：{relatedTaskId}</div>}
        <Countdown
          refresh={clockRefresh}
          setRefresh={setClockRefresh}
          countdown={countdown}
          state={clockState}
          onComplete={completeFocus}
        />
      </Flex>
      <div className={styles['actions']}>
        <PlayController
          className={clsx(styles['action'], 'action-play')}
          state={clockState}
          onToggle={toggleFocus}
        />
        <ReloadOutlined
          className={clsx(styles['action'], 'action-reload')}
          onClick={handleRefresh}
          style={{ color: '#fff', fontSize: '30px' }}
        />
        <Setting
          className={clsx(styles['action'], 'action-setting')}
          onConfirm={onConfirmSetting}
        />
        {isFullscreen ? (
          <FullscreenExitOutlined
            className={clsx(styles['action'], 'action-fullscreen')}
            onClick={toggleFullscreen}
            style={{ color: '#fff', fontSize: '30px' }}
          />
        ) : (
          <FullscreenOutlined
            className={clsx(styles['action'], 'action-fullscreen')}
            onClick={toggleFullscreen}
            style={{ color: '#fff', fontSize: '30px' }}
          />
        )}
        <MinusCircleOutlined
          className={clsx(styles['action'], 'action-mini')}
          onClick={toggleMiniMode}
          style={{ color: '#fff', fontSize: '30px' }}
        />
        <button type="button" className={styles['record-button']} onClick={finishFocus}>
          结束并记录
        </button>
      </div>
    </>
  );
};

export default NormalTimer;
