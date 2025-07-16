import { MindmapNode } from '../types';

const exportNodeToText = (node: MindmapNode, layer: number, format: string): string | undefined => {
  switch (format) {
    case 'MD':
      if (layer < 6) {
        return '#'.repeat(layer + 1) + ' ' + node.text;
      }
      return '\t'.repeat(layer - 6) + '- ' + node.text;
    case 'TXT':
      return '\t'.repeat(layer) + node.text;
    default:
      return;
  }
};

const exportMindmapToText = (mindmap: MindmapNode, format: string): string => {
  const lines: string[] = [];
  const dfs = (node: MindmapNode, layer: number, format: string) => {
    if (!node) {
      return;
    }
    const textResult = exportNodeToText(node, layer, format);
    if (textResult) {
      lines.push(textResult);
    }
    node.children.forEach((child: MindmapNode) => {
      dfs(child, layer + 1, format);
    });
  };
  dfs(mindmap, 0, format);
  return lines.join('\n');
};

const copyNodeData = (
  format: string,
  target_node: MindmapNode,
  source_node: MindmapNode
): MindmapNode | undefined => {
  switch (format) {
    case 'KM':
      target_node.data = {};
      target_node.data.id = source_node.id;
      target_node.data.created = Date.now();
      target_node.data.text = source_node.text;
      target_node.data.expandState = source_node.showChildren ? 'expand' : 'collapse';
      target_node.children = source_node.children
        .map((child: MindmapNode) => copyNodeData(format, {} as MindmapNode, child))
        .filter((child): child is MindmapNode => child !== undefined);
      return target_node;
    default:
      return;
  }
};

const exportMindmapToJSON = (mindmap: MindmapNode, format: string): string | undefined => {
  switch (format) {
    case 'KM':
      const km_mindmap = { root: copyNodeData(format, {} as MindmapNode, mindmap) };
      return JSON.stringify(km_mindmap);
    default:
      return;
  }
};

export default (mindmap: MindmapNode, format: string): string | undefined => {
  let export_data: string | undefined;
  switch (format) {
    case 'MD':
    case 'TXT':
      export_data = exportMindmapToText(mindmap, format);
      break;
    default:
      export_data = exportMindmapToJSON(mindmap, format);
      break;
  }
  return export_data;
};
