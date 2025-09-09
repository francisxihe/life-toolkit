import { FC, PropsWithChildren, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import type { Identifier, XYCoord } from 'dnd-core';
import update from 'immutability-helper';
import { useTabs } from './store';

// 定义拖拽类型
export const ItemTypes = {
  Tab: 'wtabs',
};

export interface TabProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  id: string;
  index?: number;
  /** Whether the Y axis can be dragged */
  dragableY?: boolean;
  active?: boolean;
  onTabClick?: (id: string, evn: React.MouseEvent<HTMLDivElement>) => void;
  onTabDrop?: (id: string, index?: number, offset?: XYCoord | null) => void;
}

export interface DragItem {
  index: number;
  id: string;
  type: string;
}

export const Tab: FC<PropsWithChildren<TabProps>> = ({
  children,
  id,
  index,
  dragableY = false,
  active = false,
  onTabClick,
  onTabDrop,
  ...props
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { state, setActiveKey, setData } = useTabs();

  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: Identifier | null }>({
    accept: ItemTypes.Tab,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item, monitor) {
      if (!ref.current || !state.data) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index || 0;
      // 不要用自己替换项目
      if (dragIndex === hoverIndex) {
        return;
      }
      // 确定屏幕上的矩形
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      // 获取垂直中间
      const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
      // 确定鼠标位置
      const clientOffset = monitor.getClientOffset();
      // if (!clientOffset) return;
      // 将像素移到顶部
      const hoverClientX = (clientOffset as XYCoord).x - hoverBoundingRect.left;
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX && dragableY !== true) {
        return;
      }
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) {
        return;
      }
      const newdata = update(state.data, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, state.data[dragIndex]],
        ],
      });
      setData([...newdata]);
      item.index = hoverIndex;
    },
  });

  // 简化版本的拖拽功能
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: ItemTypes.Tab,
      item: () => {
        return { id, index };
      },
      end: (item, monitor) => {
        const clientOffset = monitor.getClientOffset();
        onTabDrop && onTabDrop(id, item.index, clientOffset);
      },
      collect: (monitor) => {
        return {
          isDragging: monitor.isDragging(),
        };
      },
    }),
    [id, index, onTabDrop]
  );

  const opacity = isDragging ? 0.4 : 1;

  if (props.draggable !== false) {
    drag(drop(ref));
  }

  const handleClick = (evn: React.MouseEvent<HTMLDivElement>) => {
    setActiveKey(id);
    onTabClick && onTabClick(id, evn);
  };

  return (
    <div
      {...props}
      onClick={handleClick}
      ref={ref}
      style={{ ...props.style, opacity }}
      className={`w-tabs-draggable-item ${state.activeKey === id ? 'tabs-item-active' : ''} ${props.className || ''}`}
      data-handler-id={handlerId}
    >
      {children}
    </div>
  );
};
