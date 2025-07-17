import React, { useState, useEffect, useRef } from 'react';
import { css } from '@emotion/css';
import { useMindmapActions, useNodeActions, useGlobalActions } from '../../context';
import getDragEvents from '../../methods/getDragEvents';
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

  const { getCurrentTheme, globalState } = useGlobalActions();
  const theme = getCurrentTheme();
  const mindmapActions = useMindmapActions();
  const nodeActions = useNodeActions();
  const { zoom, x, y } = globalState;

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
    // 合并 mindmapActions 和 nodeActions 作为 getDragEvents 的参数
    const mindmapHookReplacement = {
      ...mindmapActions,
      ...nodeActions
    };
    const handleDrag = getDragEvents(
      mindmap,
      self.current,
      container_ref.current,
      theme,
      mindmapHookReplacement,
      zoom,
      { x, y }
    );
    const mindmapElement = document.querySelector(`#${refer.MINDMAP_ID}`);
    if (!mindmapElement) return;

    handleDrag.forEach(event => mindmapElement.addEventListener(event.type, event.listener));
    return () => {
      handleDrag.forEach(event => mindmapElement.removeEventListener(event.type, event.listener));
    };
  }, [mindmap, theme, zoom, x, y, container_ref, mindmapActions, nodeActions]);

  useEffect(() => {
    const dom = self.current;
    if (!dom || !parent_ref.current) return;

    dom.width = parent_ref.current.offsetWidth;
    dom.height = parent_ref.current.offsetHeight;
  }, [mindmap, flag, globalState.zoom, parent_ref]);

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
