import { PauseCircleOutlined, PlayCircleOutlined } from '@ant-design/icons';
import React from 'react';

interface PlayControllerProps {
  state: boolean;
  onToggle: () => void;
  className?: string;
}

const PlayController: React.FC<PlayControllerProps> = ({
  state,
  onToggle,
  className,
}) => {
  const handleClick = () => {
    onToggle();
  };

  return (
    <>
      {!state ? (
        <PlayCircleOutlined
          className={className}
          onClick={handleClick}
          style={{ color: '#fff', fontSize: '30px' }}
        />
      ) : (
        <PauseCircleOutlined
          className={className}
          onClick={handleClick}
          style={{ color: '#fff', fontSize: '30px' }}
        />
      )}
    </>
  );
};

export default PlayController;
