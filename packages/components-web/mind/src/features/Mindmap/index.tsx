import React, {
  useEffect,
  useContext,
  useRef,
  useMemo,
  useState,
  RefObject,
  useCallback,
} from 'react';
import { css } from '@emotion/css';
import * as refer from '../../statics/refer';
import { context } from '../../context';
import { setHistory } from '../../context/reducer/history/actionCreator';
import useMindmap from '../../customHooks/useMindmap';
import useHistory from '../../customHooks/useHistory';
import getKeydownEvent from '../../methods/getKeydownEvent';
import getMouseWheelEvent from '../../methods/getMouseWheelEvent';
import RootNode from '../../components/RootNode';
import DragCanvas from '../../components/DragCanvas';
import LineCanvas from '../../components/LineCanvas';
// import useZoom from '../../customHooks/useZoom';
// import useMove from '../../customHooks/useMove';
// import { debounce } from '../../methods/assistFunctions';

interface MindmapProps {
  container_ref: RefObject<HTMLDivElement>;
}

const node_refs = new Set<RefObject<HTMLDivElement>>();

const Mindmap: React.FC<MindmapProps> = ({ container_ref }) => {
  const {
    mindmap: { state: mindmap },
    nodeStatus: { state: nodeStatus },
    global: { state: gState, dispatch: gDispatch },
    history: { dispatch: hDispatch },
  } = useContext(context);

  const mindmapHook = useMindmap();
  const historyHook = useHistory();
  // const zoomHook = useZoom();
  // const moveHook = useMove();

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

  useEffect(() => {
    const handleMouseWheel = getMouseWheelEvent(gDispatch, container_ref.current!);
    const mainElement = document.querySelector(`#${refer.MINDMAP_MAIN}`) as HTMLElement;
    if (mainElement) {
      mainElement.addEventListener('wheel', handleMouseWheel);
      return () => {
        mainElement.removeEventListener('wheel', handleMouseWheel);
      };
    }
  }, [gDispatch, container_ref]);

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
      hDispatch(setHistory(mindmap, nodeStatus.cur_select || ''));
      setMindmapSnapshot(newSnapshot);
    }
  }, [mindmap, mindmapSnapshot, nodeStatus.cur_select, hDispatch]);

  const style = useMemo(() => {
    return css`
      position: relative;
      width: 100%;
      height: 100%;
      background-color: var(--theme-light);
      transform: scale(${gState.zoom}) translate(${gState.x}px, ${gState.y}px);
      transform-origin: 0 0;
    `;
  }, [gState.zoom, gState.x, gState.y]);

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
