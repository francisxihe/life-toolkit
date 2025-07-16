import React, { useReducer, Dispatch } from 'react';
import mindmapReducer, { defaultValue_mindmap } from './reducer/mindmap/';
import nodeStatusReducer, { defaultValue_nodeStatus } from './reducer/nodeStatus';
import historyReducer, { defaultValue_history } from './reducer/history';
import globalReducer, { defaultValue_global } from './reducer/global';
import editPanelReducer, { defaultValue_editPanel } from './reducer/editPanel';
import { MindmapNode } from '../types';
import { Action as MindmapAction } from './reducer/mindmap/actionCreator';
import { Action as NodeStatusAction } from './reducer/nodeStatus/actionCreator';
import { Action as HistoryAction } from './reducer/history/actionCreator';
import { Action as GlobalAction } from './reducer/global/actionCreator';
import { Action as EditPanelAction } from './reducer/editPanel/actionCreator';
import { GlobalState } from './reducer/global';

interface NodeStatus {
  cur_select: string | null;
  cur_edit: string | null;
  select_by_click: boolean;
  cur_node_info: Partial<MindmapNode> & {
    parent?: MindmapNode;
    on_left?: boolean;
  };
}

interface History {
  past: string[];
  future: string[];
  cur_node: string | null;
}

interface EditPanel {
  isShow: boolean;
  type: string;
  data: any;
}

interface ContextState {
  mindmap: {
    state: MindmapNode;
    dispatch: Dispatch<MindmapAction>;
  };
  nodeStatus: {
    state: NodeStatus;
    dispatch: Dispatch<NodeStatusAction>;
  };
  history: {
    state: History;
    dispatch: Dispatch<HistoryAction>;
  };
  global: {
    state: GlobalState;
    dispatch: Dispatch<GlobalAction>;
  };
  editPanel: {
    state: EditPanel;
    dispatch: Dispatch<EditPanelAction>;
  };
}

export const context = React.createContext<ContextState>({} as ContextState);

const WrappedProvider: React.FC<{ children: React.ReactNode }> = props => {
  const [mState, mDispatch] = useReducer(mindmapReducer, defaultValue_mindmap);
  const [nState, nDispatch] = useReducer(nodeStatusReducer, defaultValue_nodeStatus);
  const [hState, hDispatch] = useReducer(historyReducer, defaultValue_history);
  const [gState, gDispatch] = useReducer(globalReducer, defaultValue_global);
  const [epState, epDispatch] = useReducer(editPanelReducer, defaultValue_editPanel);

  const combined = {
    mindmap: {
      state: mState,
      dispatch: mDispatch,
    },
    nodeStatus: {
      state: nState,
      dispatch: nDispatch,
    },
    history: {
      state: hState,
      dispatch: hDispatch,
    },
    global: {
      state: gState,
      dispatch: gDispatch,
    },
    editPanel: {
      state: epState,
      dispatch: epDispatch,
    },
  };

  return <context.Provider value={combined}>{props.children}</context.Provider>;
};

export default WrappedProvider;
