import { Graph } from '@antv/x6';
import { MindMapData } from '../types';

/**
 * 将思维导图导出为 JSON
 * @param data 思维导图数据
 * @returns JSON 字符串
 */
export const exportToJSON = (data: MindMapData): string => {
  return JSON.stringify(data, null, 2);
};

/**
 * 从 JSON 导入思维导图
 * @param json JSON 字符串
 * @returns 思维导图数据
 */
export const importFromJSON = (json: string): MindMapData | null => {
  try {
    return JSON.parse(json);
  } catch (error) {
    console.error('导入 JSON 失败:', error);
    return null;
  }
};

/**
 * 将思维导图导出为图片
 * @param graph X6 Graph 实例
 * @param fileName 文件名
 * @param transparent 是否透明背景
 */
export const exportToPNG = (
  graph: Graph,
  fileName: string = 'mindmap',
  transparent: boolean = false
): void => {
  graph.toPNG(
    dataUri => {
      const link = document.createElement('a');
      link.download = `${fileName}.png`;
      link.href = dataUri;
      link.click();
    },
    {
      backgroundColor: transparent ? 'transparent' : '#ffffff',
      padding: 20,
      quality: 1,
    }
  );
};

/**
 * 将思维导图导出为 SVG
 * @param graph X6 Graph 实例
 * @param fileName 文件名
 */
export const exportToSVG = (graph: Graph, fileName: string = 'mindmap'): void => {
  graph.toSVG(
    dataUri => {
      const link = document.createElement('a');
      link.download = `${fileName}.svg`;
      link.href = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(dataUri)}`;
      link.click();
    },
    {
      preserveDimensions: true,
      copyStyles: true,
      stylesheet: '',
    }
  );
};

/**
 * 从本地文件导入 JSON
 * @param file 文件对象
 * @returns Promise 解析为思维导图数据
 */
export const importJSONFromFile = (file: File): Promise<MindMapData | null> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = event => {
      try {
        const json = event.target?.result as string;
        const data = JSON.parse(json);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = error => {
      reject(error);
    };

    reader.readAsText(file);
  });
};
