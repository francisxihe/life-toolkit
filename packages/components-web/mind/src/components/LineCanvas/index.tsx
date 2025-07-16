import React, { useState, useEffect, useRef, useContext } from 'react';
import { css } from '@emotion/css';
import useTheme from '../../customHooks/useTheme';
import { context } from '../../context';
import { drawLineCanvas } from '../../methods/drawCanvas';
import { MindmapNode } from '../../types';

interface LineCanvasProps {
  parent_ref: React.RefObject<HTMLDivElement>;
  mindmap: MindmapNode;
  node_refs: Set<React.RefObject<HTMLDivElement>>;
}

const LineCanvas: React.FC<LineCanvasProps> = ({ parent_ref, mindmap, node_refs }) => {
  const self = useRef<HTMLCanvasElement>(null);
  const [flag, setFlag] = useState<number>(0);

  const { theme } = useTheme();
  const {
    global: { state: gState },
  } = useContext(context);

  const handleWindowResize = () => {
    setFlag(Date.now());
  };

  useEffect(() => {
    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  useEffect(() => {
    const dom = self.current;
    if (!dom || !parent_ref.current) return;

    dom.width = parent_ref.current.offsetWidth;
    dom.height = parent_ref.current.offsetHeight; // 重新设置 canvas 大小，也兼具清除画板的作用

    const map = new Map(
      Array.from(node_refs)
        .map(ref => {
          if (!ref.current) return null;
          return [
            ref.current.id,
            [
              ref.current.offsetLeft,
              ref.current.offsetLeft + ref.current.offsetWidth,
              ref.current.offsetTop + 0.5 * ref.current.offsetHeight,
              ref.current.dataset.tag,
            ],
          ];
        })
        .filter((item): item is [string, [number, number, number, string]] => item !== null)
    );

    const ctx = dom.getContext('2d');
    if (!ctx) return;

    drawLineCanvas(ctx, theme, mindmap, map);
    // TODO: Implement line drawing functionality
    console.log('Drawing lines for mindmap:', mindmap.id);
  }, [mindmap, theme, flag, gState.zoom, node_refs, parent_ref]);

  return <canvas ref={self} className={wrapper} />;
};

export default LineCanvas;

// CSS
const wrapper = css`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  pointer-events: none;
`;
