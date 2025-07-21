import React, { useRef } from 'react';
import { css } from '@emotion/css';
import Mindmap from '../Mindmap';
import EditPanel from '../EditPanel';
import * as refer from '../../statics/refer';

interface MainProps {}

const Main: React.FC<MainProps> = () => {
  const self = useRef<HTMLDivElement>(null);

  return (
    <main ref={self} className={wrapper} id={refer.MINDMAP_MAIN}>
      <Mindmap container_ref={self} />
      <EditPanel />
    </main>
  );
};

export default Main;

// CSS
const wrapper = css`
  height: 100%;
  margin: 56px 0 0;
  overflow: hidden;
`;
