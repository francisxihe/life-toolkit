/** @jsxImportSource @emotion/react */
import React, { useRef, useEffect } from 'react';
import { Main, useMindmap } from '@life-toolkit/components-web-mind';

interface CustomMainProps {
  mindmapData?: any;
}

const CustomMain: React.FC<CustomMainProps> = ({ mindmapData }) => {
  const mindmapHook = useMindmap();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (mindmapData && mindmapHook.setMindmap) {
      // 设置新的脑图数据
      mindmapHook.setMindmap(mindmapData, !hasInitialized.current);
      hasInitialized.current = true;
    }
  }, [mindmapData, mindmapHook]);

  return <Main />;
};

export default CustomMain; 