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
import useZoom from '../../customHooks/useZoom';
import useMove from '../../customHooks/useMove';
import { debounce } from '../../methods/assistFunctions';

interface MindmapProps {
  container_ref: RefObject<HTMLDivElement>;
}

const node_refs = new Set<RefObject<HTMLDivElement>>();

const Mindmap: React.FC<MindmapProps> = ({ container_ref }) => {
  const self = useRef<HTMLDivElement>(null);
  const {
    mindmap: { state: root_node },
    nodeStatus: { state: nodeStatus },
    history: { dispatch: hDispatch },
    global: { state: gState },
  } = useContext(context);

  const historyHook = useHistory();
  const mindmapHook = useMindmap();
  const zoomHook = useZoom();
  const moveHook = useMove();
  const { clearNodeStatus } = mindmapHook;
  const [FLAG, setFLAG] = useState(0);

  const mindmap_json = useMemo(() => JSON.stringify(root_node), [root_node]);

  const handleResize = useCallback(() => {
    setFLAG(Date.now());
  }, []);

  useEffect(() => {
    const handleKeydown = getKeydownEvent(nodeStatus, mindmapHook, historyHook);
    window.addEventListener('keydown', handleKeydown);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [nodeStatus, mindmapHook, historyHook]);

  useEffect(() => {
    window.addEventListener('click', clearNodeStatus);
    return () => {
      window.removeEventListener('click', clearNodeStatus);
    };
  }, [clearNodeStatus]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  useEffect(() => {
    const handleMouseWheel = getMouseWheelEvent(zoomHook, gState.zoom);
    const handleMapMove = getMouseWheelEvent(moveHook, gState.zoom);
    const mainElement = document.querySelector(`#${refer.MINDMAP_MAIN}`) as HTMLElement;
    if (mainElement) {
      mainElement.addEventListener('wheel', handleMouseWheel);
      mainElement.addEventListener('mousemove', debounce(handleMapMove, 4));
      mainElement.addEventListener('mousedown', handleMapMove);
      return () => {
        mainElement.removeEventListener('wheel', handleMouseWheel);
        mainElement.removeEventListener('mousemove', debounce(handleMapMove, 4));
        mainElement.removeEventListener('mousedown', handleMapMove);
      };
    }
  }, [FLAG, gState.zoom, zoomHook, moveHook]);

  useEffect(() => {
    localStorage.setItem('mindmap', mindmap_json);
    hDispatch(setHistory(mindmap_json, nodeStatus.cur_select || nodeStatus.cur_edit));
  }, [mindmap_json, nodeStatus.cur_select, nodeStatus.cur_edit, hDispatch]);

  return (
    <div
      className={wrapper}
      ref={self}
      style={{ zoom: gState.zoom, left: gState.x + 'vw', top: gState.y + 'vh' }}
      id={refer.MINDMAP_ID}
      draggable={false}
    >
      <RootNode key={root_node.id} layer={0} node={root_node} node_refs={node_refs} />
      <DragCanvas parent_ref={self} container_ref={container_ref} mindmap={root_node} />
      <LineCanvas parent_ref={self} mindmap={root_node} node_refs={node_refs} />
    </div>
  );
};

export default Mindmap;

// CSS
const wrapper = css`
  position: relative;
  width: fit-content;
  padding: 30vh 30vw;
`;
