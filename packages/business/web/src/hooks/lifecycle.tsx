import { useEffect, useState } from 'react';

export function useComponentLoad(fn: () => Promise<void>) {
  const [componentLoaded, setComponentLoaded] = useState(false);

  useEffect(() => {
    async function init() {
      if (!componentLoaded) {
        await fn();
      }
    }
    init();
  }, [fn, componentLoaded]);

  return {
    // 完成加载
    handleComponentLoaded: () => {
      setComponentLoaded(true);
    },
  };
}
