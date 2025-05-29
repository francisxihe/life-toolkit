import React, { useState, useEffect } from 'react';
import './Flip.css';

interface FlipProps {
  total: number;
  current: number;
}

const Flip: React.FC<FlipProps> = ({ total, current }) => {
  const [before, setBefore] = useState<number>(total === current ? -1 : total);
  const [isPlay, setIsPlay] = useState<boolean>(false);

  useEffect(() => {
    if (current !== before) {
      setBefore(before);
      if (!isPlay) {
        setIsPlay(true);
      }
    }
  }, [current]);

  // 创建从0到total的数组用于循环
  const items = Array.from({ length: total + 1 }, (_, i) => i);

  return (
    <div className={`${isPlay ? 'play' : ''}`}>
      <ul className="flip">
        {items.map((item) => (
          <li
            className={`item ${current === item ? 'active' : ''} ${item === before ? 'before' : ''}`}
            key={item}
          >
            <div className="up">
              <div className="shadow"></div>
              <div className="inn">{item}</div>
            </div>
            <div className="down">
              <div className="shadow"></div>
              <div className="inn">{item}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Flip; 