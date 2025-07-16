import { ROOT_NODE_ID } from './refer';
import { MindmapNode } from '../types';

const defaultMindmap: MindmapNode = {
  id: ROOT_NODE_ID,
  text: '主题',
  showChildren: true,
  children: [
    {
      id: 'Sub1',
      text: '分支1',
      showChildren: true,
      children: [],
    },
    {
      id: 'Sub2',
      text: '分支2',
      showChildren: true,
      children: [],
    },
    {
      id: 'Sub3',
      text: '分支3',
      showChildren: true,
      children: [],
    },
  ],
};

export default defaultMindmap;
