'use client';

import { FlexibleContainer } from 'francis-component-react';
import clsx from 'clsx';

const { Fixed, Shrink } = FlexibleContainer;

export default function DefaultPage(props: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <FlexibleContainer className="bg-bg-2 rounded-lg w-full h-full">
      <Fixed className="px-5 py-2 flex justify-between items-center border-b">
        <div className="text-text-1 text-title-2 font-medium py-1">
          {props.title}
        </div>
      </Fixed>

      <Shrink className={clsx('px-5 w-full h-full', 'flex flex-col gap-3')}>
        {props.children}
      </Shrink>
    </FlexibleContainer>
  );
}
