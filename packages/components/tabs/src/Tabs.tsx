import React, { FC, isValidElement, PropsWithChildren, useEffect, useLayoutEffect } from 'react';
import { useDrop } from 'react-dnd';
import { useTabs, TabsState } from './store';
import { ItemTypes } from './Tab';
import { TabsProps } from './';

export const Tabs: FC<PropsWithChildren<TabsProps>> = ({ children, activeKey, ...props }) => {
  const { state, setActiveKey, setData } = useTabs();
  const [, drop] = useDrop(() => ({
    accept: ItemTypes.Tab,
  }));

  useEffect(() => {
    setActiveKey(state.activeKey);
  }, [state.activeKey]);

  useLayoutEffect(() => {
    if (children) {
      const data: TabsState['data'] = [];
      React.Children.toArray(children).forEach((item) => {
        if (isValidElement(item)) {
          data.push({ ...item.props, element: item });
        }
      });
      setData(data);
    }
  }, [children]);

  return (
    <div
      {...props}
      ref={drop}
      className={`w-tabs-draggable ${props.className || ''}`}
      style={{ display: 'flex', ...props.style }}
    >
      {state.data &&
        state.data.length > 0 &&
        state.data.map(({ element, ...child }, idx) => {
          if (isValidElement(element)) {
            return React.cloneElement<any>(element, { ...child, index: idx });
          }
        })}
    </div>
  );
};
