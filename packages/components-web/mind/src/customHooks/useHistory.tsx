import { useContext } from 'react';
import { context } from '../context';
import * as mindmapAction from '../context/reducer/mindmap/actionCreator';
import * as nodeStatusAction from '../context/reducer/nodeStatus/actionCreator';
import { MindmapNode } from '../types';

interface HistoryHookReturn {
  undo: () => void;
  redo: () => void;
}

const useHistory = (): HistoryHookReturn => {
  const {
    mindmap: { dispatch: mDispatch },
    nodeStatus: { dispatch: nDispatch },
    history: { state: history },
  } = useContext(context);

  const applySnapshot = (snapshot: string) => {
    const mindmap: MindmapNode = JSON.parse(snapshot);
    mDispatch(mindmapAction.setMindmap(mindmap));
    nDispatch(nodeStatusAction.clearAll());
  };

  return {
    undo: () => {
      if (history.past.length > 0) {
        applySnapshot(history.past[history.past.length - 1]);
      }
    },
    redo: () => {
      if (history.future.length > 0) {
        applySnapshot(history.future[0]);
      }
    },
  };
};

export default useHistory;
