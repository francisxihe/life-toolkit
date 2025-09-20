import React, { useState, useEffect, useRef } from 'react';
import './Flip.css';

interface FlipProps {
  total: number;
  current: number;
}

const Flip: React.FC<FlipProps> = ({ total, current }) => {
  const [before, setBefore] = useState<number>(current);
  const [isPlay, setIsPlay] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 清除之前的定时器
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (current !== before) {
      setIsPlay(true);

      // 动画结束后重置状态
      timerRef.current = setTimeout(() => {
        setBefore(current);
        setIsPlay(false);
      }, 1000); // 动画总时长是1秒 (0.5s + 0.5s)
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [current, before]);

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

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
