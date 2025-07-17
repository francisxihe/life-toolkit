import React, {
  useEffect,
  useRef,
  useMemo,
  useState,
  RefObject,
  useCallback,
} from 'react';
import { css } from '@emotion/css';
import * as refer from '../../statics/refer';
import { 
  useMindmapActions, 
  useNodeActions, 
  useHistoryActions,
  useGlobalActions
} from '../../context';
import getKeydownEvent from '../../methods/getKeydownEvent';
import getMouseWheelEvent from '../../methods/getMouseWheelEvent';
import RootNode from '../../components/RootNode';
import DragCanvas from '../../components/DragCanvas';
import LineCanvas from '../../components/LineCanvas';

interface MindmapProps {
  container_ref: RefObject<HTMLDivElement>;
}

const node_refs = new Set<RefObject<HTMLDivElement>>();

const Mindmap: React.FC<MindmapProps> = ({ container_ref }) => {
  const { mindmap } = useMindmapActions();
  const { nodeStatus } = useNodeActions();
  const { globalState } = useGlobalActions();
  const { addToHistory } = useHistoryActions();
  
  // 创建组合对象以兼容旧的 API
  const mindmapHook = useMindmapActions();
  const historyHook = useHistoryActions();

  const [mindmapSnapshot, setMindmapSnapshot] = useState<string>(JSON.stringify(mindmap));

  const handleResize = useCallback(() => {
    // Handle window resize
    console.log('Window resized');
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  // 获取全局操作的方法
  const { setZoom, moveBy } = useGlobalActions();
  
  useEffect(() => {
    // 创建一个适配器函数，将新的 API 适配到旧的 getMouseWheelEvent 函数
    const dispatchAdapter = (action: any) => {
      // 根据 action 类型调用相应的方法
      if (action.type === 'ZOOM_IN' || action.type === 'ZOOM_OUT') {
        const delta = action.type === 'ZOOM_IN' ? 0.1 : -0.1;
        setZoom(globalState.zoom + delta);
      } else if (action.type === 'MOVE_XY') {
        moveBy(action.data.x || 0, action.data.y || 0);
      }
    };
    
    const handleMouseWheel = getMouseWheelEvent(dispatchAdapter, container_ref.current!);
    const mainElement = document.querySelector(`#${refer.MINDMAP_MAIN}`) as HTMLElement;
    if (mainElement) {
      mainElement.addEventListener('wheel', handleMouseWheel);
      return () => {
        mainElement.removeEventListener('wheel', handleMouseWheel);
      };
    }
  }, [container_ref, setZoom, moveBy, globalState.zoom]);

  useEffect(() => {
    const handleKeydown = getKeydownEvent(nodeStatus, mindmapHook, historyHook);
    document.addEventListener('keydown', handleKeydown);
    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [nodeStatus, mindmapHook, historyHook]);

  useEffect(() => {
    const newSnapshot = JSON.stringify(mindmap);
    if (newSnapshot !== mindmapSnapshot) {
      addToHistory(mindmap, nodeStatus.cur_select || '');
      setMindmapSnapshot(newSnapshot);
    }
  }, [mindmap, mindmapSnapshot, nodeStatus.cur_select, addToHistory]);

  const style = useMemo(() => {
    return css`
      position: relative;
      width: 100%;
      height: 100%;
      background-color: var(--theme-light);
      transform: scale(${globalState.zoom}) translate(${globalState.x}px, ${globalState.y}px);
      transform-origin: 0 0;
    `;
  }, [globalState.zoom, globalState.x, globalState.y]);

  const self = useRef<HTMLDivElement>(null);

  return (
    <div id={refer.MINDMAP_MAIN} className={style} ref={self}>
      <RootNode layer={0} node={mindmap} node_refs={node_refs} />
      <DragCanvas parent_ref={self} container_ref={container_ref} mindmap={mindmap} />
      <LineCanvas parent_ref={self} mindmap={mindmap} node_refs={node_refs} />
    </div>
  );
};

export default Mindmap;
