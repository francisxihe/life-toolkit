'use client';

import { FlexibleContainer } from 'francis-component-react';
import clsx from 'clsx';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const { Fixed, Shrink } = FlexibleContainer;

export default function TabsPage(props: {
  tabs: {
    name: string;
    path: string;
  }[];
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <FlexibleContainer className="bg-bg-2 rounded-lg w-full h-full">
      <Fixed className="px-5 flex items-center border-b gap-4">
        {props.tabs.map((tab) => (
          <div
            key={tab.path}
            className={clsx(
              'pt-4 pb-3 px-2',
              'border-b-2 border-transparent cursor-pointer',
              'text-text-1 text-title-1',
              {
                '!border-primary font-medium cursor-default':
                  location.pathname === tab.path,
              },
            )}
            onClick={() => {
              navigate(tab.path);
            }}
          >
            {tab.name}
          </div>
        ))}
      </Fixed>

      <Shrink
        className={clsx(
          'px-5 w-full h-full',
          'flex flex-col gap-3',
          'overflow-y-auto',
        )}
      >
        {props.children}
      </Shrink>
    </FlexibleContainer>
  );
}
