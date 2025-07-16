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

export interface NodeStatus {
  cur_select: string | null;
  cur_edit: string | null;
  select_by_click: boolean;
  cur_node_info: Partial<MindmapNode> & {
    parent?: MindmapNode;
    on_left?: boolean;
  };
}

export interface History {
  past: string[];
  future: string[];
  cur_node: string | null;
  undo: string[];
  redo: string[];
}

export interface EditPanel {
  isShow: boolean;
  type: string;
  data: any;
}

export interface GlobalState {
  zoom: number;
  x: number;
  y: number;
  title: string;
  theme_index: number;
  theme_list: Theme[];
}

export interface Theme {
  main: string;
  light: string;
  dark: string;
  ex: string;
  assist: string;
}

export interface NodeOffset {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface MouseMoveInfo {
  x: number;
  y: number;
  zoom: number;
}
