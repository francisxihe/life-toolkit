import { useContext } from 'react';
import { context } from '../context';
import * as mindmapAction from '../context/reducer/mindmap/actionCreator';
import * as nodeStatusAction from '../context/reducer/nodeStatus/actionCreator';
import { clearHistory } from '../context/reducer/history/actionCreator';
import md5 from 'md5';
import { MindmapNode } from '../types';

interface MindmapHookReturn {
  toggleChildren: (node_id: string, bool: boolean) => void;
  addChild: (node_id: string) => void;
  addSibling: (node_id: string, parent_id: string) => void;
  moveNode: (node_id: string, target_id: string, parent_id: string, is_sibling: boolean) => void;
  editNode: (node_id: string) => void;
  changeText: (node_id: string, text: string) => void;
  editNodeInfo: (node_id: string, info: MindmapNode['info']) => void;
  selectNode: (node_id: string, select_by_click?: boolean) => void;
  deleteNode: (node_id: string, parent_id: string) => void;
  clearNodeStatus: () => void;
  setMindmap: (mindmap: MindmapNode, is_new_map?: boolean) => void;
  expandAll: (node_id: string) => void;
}

const useMindmap = (): MindmapHookReturn => {
  const {
    mindmap: { dispatch: mDispatch },
    nodeStatus: { dispatch: nDispatch },
    history: { dispatch: hDispatch },
  } = useContext(context);
  return {
    toggleChildren: (node_id: string, bool: boolean) => {
      mDispatch(mindmapAction.toggleChildren(node_id, { showChildren: bool }));
    },
    addChild: (node_id: string) => {
      const new_node_id = md5('' + Date.now() + Math.random());
      const newNode: MindmapNode = {
        id: new_node_id,
        text: '',
        showChildren: true,
        children: [],
      };
      mDispatch(mindmapAction.toggleChildren(node_id, { showChildren: true }));
      mDispatch(mindmapAction.addChild(node_id, newNode));
      nDispatch(nodeStatusAction.setEdit(new_node_id));
    },
    addSibling: (node_id: string, parent_id: string) => {
      const new_node_id = md5('' + Date.now() + Math.random());
      const newNode: MindmapNode = {
        id: new_node_id,
        text: '',
        showChildren: true,
        children: [],
      };
      mDispatch(mindmapAction.addSibling(node_id, parent_id, newNode));
      nDispatch(nodeStatusAction.setEdit(new_node_id));
    },
    moveNode: (node_id: string, target_id: string, parent_id: string, is_sibling: boolean) => {
      mDispatch(mindmapAction.moveNode(node_id, parent_id, target_id, is_sibling));
      nDispatch(nodeStatusAction.setSelect(node_id, false));
    },
    editNode: (node_id: string) => {
      nDispatch(nodeStatusAction.setEdit(node_id));
    },
    changeText: (node_id: string, text: string) => {
      mDispatch(mindmapAction.changeText(node_id, { text }));
    },
    editNodeInfo: (node_id: string, info: MindmapNode['info']) => {
      mDispatch(mindmapAction.setNodeInfo(node_id, { info }));
    },
    selectNode: (node_id: string, select_by_click: boolean = false) => {
      nDispatch(nodeStatusAction.setSelect(node_id, select_by_click));
    },
    deleteNode: (node_id: string, parent_id: string) => {
      mDispatch(mindmapAction.deleteNode(node_id, parent_id));
      nDispatch(nodeStatusAction.setSelect(null, false));
    },
    clearNodeStatus: () => {
      nDispatch(nodeStatusAction.clearAll());
    },
    setMindmap: (mindmap: MindmapNode, is_new_map: boolean = false) => {
      mDispatch(mindmapAction.setMindmap(mindmap));
      if (is_new_map) {
        hDispatch(clearHistory());
      }
    },
    expandAll: (node_id: string) => {
      mDispatch(mindmapAction.expandAll(node_id));
    },
  };
};

export default useMindmap;
