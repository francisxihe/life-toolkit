import md5 from 'md5';
import * as refer from '../statics/refer';
import { MindmapNode } from '../types';

interface LayerAndText {
  layer: number;
  text: string;
}

const getLayerAndText = (line: string, format: string): LayerAndText => {
  let layer: number = 0;
  let text: string = '';
  switch (format) {
    case 'MD': {
      if (line.match(/^#{1,6} /)) {
        const match = line.match(/^#{1,6} /);
        if (match) {
          layer = match[0].length - 2;
          text = line.replace(/^#{1,6} /, '');
        }
      } else if (line.match(/^\s*[-*] /)) {
        const match = line.match(/^\s*[-*] /);
        if (match) {
          layer = match[0].length + 4;
          text = line.replace(/^\s*[-*] /, '');
        }
      }
      return { layer, text };
    }
    case 'TXT': {
      const match = line.match(/^\s*/);
      if (match) {
        layer = match[0].length;
        text = line.replace(/^\s*/, '');
      }
      return { layer, text };
    }
    default:
      return { layer, text };
  }
};

const buildNodeFromText = (
  data_array: string[],
  format: string,
  cur_layer: number,
  cur_text = ''
): MindmapNode | undefined => {
  if (data_array.length === 0 && cur_layer === -1) {
    return;
  }
  if (cur_layer === -1) {
    const firstLine = data_array.shift();
    if (!firstLine) return;
    const root_data = getLayerAndText(firstLine, format);
    cur_layer = root_data.layer || 0; // 一定的鲁棒性
    cur_text = root_data.text || '未知数据';
  }
  const cur_node: MindmapNode = {
    id: cur_layer === 0 ? refer.ROOT_NODE_ID : md5('' + Date.now() + Math.random() + cur_text),
    text: cur_text,
    showChildren: true,
    children: [],
  };
  while (data_array.length > 0) {
    const { layer, text } = getLayerAndText(data_array[0], format);
    if (layer <= cur_layer) {
      break;
    }
    data_array.shift();
    if (layer) {
      // 排除掉无法匹配的情况
      const result = buildNodeFromText(data_array, format, layer, text);
      if (result) {
        cur_node.children.push(result);
      }
    }
  }
  return cur_node;
};

const copyNodeData = (
  format: string,
  target_node: any,
  source_node: any,
  is_root_node?: boolean
): any => {
  switch (format) {
    case 'KM':
      target_node.id = is_root_node ? refer.ROOT_NODE_ID : source_node.data.id;
      target_node.text = source_node.data.text;
      target_node.showChildren = source_node.data.expandState !== 'collapse';
      target_node.children = source_node.children.map((child: any) =>
        copyNodeData(format, {}, child)
      );
      return target_node;
    default:
      return;
  }
};

const buildNodeFromJSON = (json: string, format: string): MindmapNode | undefined => {
  switch (format) {
    case 'RMF':
      return JSON.parse(json);
    case 'KM': {
      const km_mindmap = JSON.parse(json);
      return copyNodeData(format, {}, km_mindmap.root, true);
    }
    default:
      return;
  }
};

export default (import_data: string, format: string): MindmapNode | undefined => {
  let mindmap: MindmapNode | undefined;
  switch (format) {
    case 'MD':
    case 'TXT':
      const data_array = import_data.split('\n').filter((line: string) => line);
      mindmap = buildNodeFromText(data_array, format, -1);
      break;
    default:
      mindmap = buildNodeFromJSON(import_data, format);
      break;
  }
  return mindmap;
};
