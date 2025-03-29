import { FC, PropsWithChildren, useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import type { Identifier, XYCoord } from "dnd-core";

// export const ItemTypes = {
//   Tab: "wtabs",
// };

// export interface TabProps
//   extends React.DetailedHTMLProps<
//     React.HTMLAttributes<HTMLDivElement>,
//     HTMLDivElement
//   > {
//   id: string;
//   index?: number;
//   /** Whether the Y axis can be dragged */
//   dragableY?: boolean;
//   active?: boolean;
//   onTabClick?: (id: string, evn: React.MouseEvent<HTMLDivElement>) => void;
//   onTabDrop?: (id: string, index?: number, offset?: XYCoord | null) => void;
// }

// export interface DragItem {
//   index: number;
//   id: string;
//   type: string;
// }

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

  console.log('Tab', useDrag);

  // // 简化版本的拖拽功能
  // const [{ isDragging }, drag] = useDrag(
  //   () => ({
  //     type: ItemTypes.Tab,
  //     item: () => {
  //       return { id, index };
  //     },
  //     end: (item, monitor) => {
  //       const clientOffset = monitor.getClientOffset();
  //       onTabDrop && onTabDrop(id, item.index, clientOffset);
  //     },
  //     collect: (monitor) => {
  //       return {
  //         isDragging: monitor.isDragging(),
  //       };
  //     },
  //   }),
  //   [id, index, onTabDrop]
  // );

  const opacity = isDragging ? 0.4 : 1;

  if (props.draggable !== false) {
    drag(ref);
  }

  const handleClick = (evn: React.MouseEvent<HTMLDivElement>) => {
    onTabClick && onTabClick(id, evn);
  };

  return 1;
  // <div
  //   {...props}
  //   onClick={handleClick}
  //   ref={ref}
  //   style={{ ...props.style, opacity }}
  //   className={`w-tabs-draggable-item ${props.className || ''}${active ? ' w-active' : ''}`}
  // >
  //   {children}
  // </div>
};
