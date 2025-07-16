import { MindmapNode } from '../types';
import * as refer from '../statics/refer';

interface NodeOffset {
  x: number;
  y: number;
  width: number;
  height: number;
}

const drawBezier = (
  ctx: CanvasRenderingContext2D,
  from_x: number,
  from_y: number,
  to_x: number,
  to_y: number
) => {
  ctx.beginPath();
  ctx.moveTo(from_x, from_y);
  ctx.bezierCurveTo(from_x + 50, from_y, to_x - 50, to_y, to_x, to_y);
  ctx.stroke();
};

const drawLine = (ctx: CanvasRenderingContext2D, node: MindmapNode, map: Map<string, [number, number, number, string]>) => {
  const { id: parent_id, children } = node;
  console.log('drawLine called with parent_id:', parent_id, 'children:', children);
  
  if (children.length > 0) {
    const parent_data = map.get(parent_id);
    console.log('parent_data:', parent_data);
    
    if (!parent_data) {
      console.log('No parent data found for:', parent_id);
      return;
    }
    
    const [parent_x_left, parent_x_right, parent_y] = parent_data;
    console.log('parent position:', { parent_x_left, parent_x_right, parent_y });

    children.forEach(child => {
      const child_data = map.get(child.id);
      console.log('child:', child.id, 'child_data:', child_data);
      
      if (child_data) {
        const [child_x_left, child_x_right, child_y, child_tag] = child_data;
        console.log('drawing line from parent to child:', { parent_x_left, parent_x_right, parent_y }, 'to', { child_x_left, child_x_right, child_y, child_tag });
        
        if (child_tag === refer.LEFT_NODE) {
          console.log('Drawing left node line');
          drawBezier(ctx, parent_x_left, parent_y, child_x_right, child_y);
        } else {
          console.log('Drawing right node line');
          drawBezier(ctx, parent_x_right, parent_y, child_x_left, child_y);
        }
        drawLine(ctx, child, map);
      } else {
        console.log('No child data found for:', child.id);
      }
    });
  } else {
    console.log('No children for node:', parent_id);
  }
};

export const drawLineCanvas = (
  ctx: CanvasRenderingContext2D,
  theme: { line_color: string },
  mindmap: MindmapNode,
  map: Map<string, [number, number, number, string]>
): void => {
  ctx.strokeStyle = theme.line_color;
  ctx.lineWidth = 2;
  console.log('==========');

  console.log('----------', ctx);
  console.log('----------', theme);
  console.log('----------', mindmap);
  console.log('----------map size:', map.size);
  console.log('----------map entries:', Array.from(map.entries()));
  console.log('----------mindmap children:', mindmap.children);

  drawLine(ctx, mindmap, map);
  console.log('----------1', ctx);
};

export const drawDragCanvas = (
  ctx: CanvasRenderingContext2D,
  theme: { main: string },
  child_id: string,
  parent_offset: { top: number; bottom: number; left: number; right: number },
  child_offset: { top: number; bottom: number; left: number; right: number },
  child_left_of_parent: boolean
) => {
  const virtual_rect_width = 50,
    virtual_rect_height = 20;
  ctx.beginPath();
  ctx.strokeStyle = theme.main;
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  let parent_x,
    parent_y = (parent_offset.top + parent_offset.bottom) / 2,
    child_x,
    child_y = (child_offset.top + child_offset.bottom) / 2;
  if (child_left_of_parent) {
    parent_x = parent_offset.left;
    child_x = child_offset.right;
    ctx.strokeRect(
      child_x - virtual_rect_width,
      child_y - virtual_rect_height / 2,
      virtual_rect_width,
      virtual_rect_height
    );
  } else {
    parent_x = parent_offset.right;
    child_x = child_offset.left;
    ctx.strokeRect(
      child_x,
      child_y - virtual_rect_height / 2,
      virtual_rect_width,
      virtual_rect_height
    );
  }
  drawBezier(ctx, parent_x, parent_y, child_x, child_y);
  ctx.stroke();
  ctx.closePath();
};
