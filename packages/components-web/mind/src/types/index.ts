export interface MindmapNode {
  id: string;
  text: string;
  showChildren: boolean;
  children: MindmapNode[];
  style?: React.CSSProperties;
  position?: {
    x: number;
    y: number;
  };
  info?: {
    description?: string;
    tags?: string[];
    priority?: number;
    [key: string]: any;
  };
  data?: {
    id?: string;
    created?: number;
    text?: string;
    expandState?: 'expand' | 'collapse';
  };
}
