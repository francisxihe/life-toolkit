import React from 'react';
import { IconPlayCircle, IconPauseCircle } from '@arco-design/web-react/icon';

interface PlayControllerProps {
  state: boolean;
  setState: (state: boolean) => void;
  className?: string;
}

const PlayController: React.FC<PlayControllerProps> = ({
  state,
  setState,
  className
}) => {
  const handleClick = () => {
    setState(!state);
  };

  return (
    <>
      {!state ? (
        <IconPlayCircle
          className={className}
          onClick={handleClick}
          style={{ color: '#fff', fontSize: '30px' }}
        />
      ) : (
        <IconPauseCircle
          className={className}
          onClick={handleClick}
          style={{ color: '#fff', fontSize: '30px' }}
        />
      )}
    </>
  );
};

export default PlayController; 