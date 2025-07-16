import React, { useState, useEffect, useRef, useContext } from 'react';
import { css } from '@emotion/css';
import useMindmap from '../../customHooks/useMindmap';
import useTheme from '../../customHooks/useTheme';
import getDragEvents from '../../methods/getDragEvents';
import { context } from '../../context';
import * as refer from '../../statics/refer';
import { MindmapNode } from '../../types';

interface DragCanvasProps {
  parent_ref: React.RefObject<HTMLDivElement>;
  container_ref: React.RefObject<HTMLDivElement>;
  mindmap: MindmapNode;
}

const DragCanvas: React.FC<DragCanvasProps> = ({ parent_ref, container_ref, mindmap }) => {
  const self = useRef<HTMLCanvasElement>(null);
  const [flag, setFlag] = useState<number>(0);

  const { theme } = useTheme();
  const mindmapHook = useMindmap();
  const {
    global: { state: gState },
  } = useContext(context);
  const { zoom, x, y } = gState;

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
    if (!self.current || !container_ref.current) return;
    const handleDrag = getDragEvents(
      mindmap,
      self.current,
      container_ref.current,
      theme,
      mindmapHook,
      zoom,
      { x, y }
    );
    const mindmapElement = document.querySelector(`#${refer.MINDMAP_ID}`);
    if (!mindmapElement) return;

    handleDrag.forEach(event => mindmapElement.addEventListener(event.type, event.listener));
    return () => {
      handleDrag.forEach(event => mindmapElement.removeEventListener(event.type, event.listener));
    };
  }, [mindmap, theme, zoom, x, y, container_ref, mindmapHook]);

  useEffect(() => {
    const dom = self.current;
    if (!dom || !parent_ref.current) return;

    dom.width = parent_ref.current.offsetWidth;
    dom.height = parent_ref.current.offsetHeight;
  }, [mindmap, flag, gState.zoom, parent_ref]);

  return <canvas ref={self} className={wrapper} />;
};

export default DragCanvas;

// CSS
const wrapper = css`
  position: absolute;
  top: 0;
  left: 0;
  z-index: -1;
`;
