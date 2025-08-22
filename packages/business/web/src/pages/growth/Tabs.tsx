'use client';

import { Outlet } from 'react-router-dom';
// import Tabs, { Tab } from '@life-toolkit/tabs/src/index';
import { useState } from 'react';
import clsx from 'clsx';
import styles from './style.module.less';

export default function Tabs({ children }: { children: React.ReactNode }) {
  // const [activeKey, setActiveKey] = useState('tab-1');

  // const handleTabClick = (id: string) => {
  //   setActiveKey(id);
  // };

  // const handleTabDrop = (id: string, index?: number) => {
  //   console.log('Tab dropped:', id, 'at index:', index);
  //   // 这里可以添加处理拖拽后的逻辑
  // };

  return {
    /* <div>
        <Tabs
          activeKey={activeKey}
          onTabClick={handleTabClick}
          onTabDrop={handleTabDrop}
          className={clsx(styles['tabs'])}
        >
          {[
            {
              id: 'tab-1',
              label: '待办任务',
            },
            {
              id: 'tab-2',
              label: '已完成',
            },
          ].map((item) => (
            <Tab
              key={item.id}
              id={item.id}
              draggable={false}
              className={clsx(
                'px-2 py-1',
                'bg-bg-2 rounded-md cursor-pointer',
                'hover:bg-fill-1 hover:text-text-1',
              )}
            >
              {item.label}
            </Tab>
          ))}
        </Tabs>
      </div> */
  };
}
