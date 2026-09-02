import { useEffect } from 'react';
import { installLabDock } from '@true-north/dev-lab/dock';

export function LabAttach() {
  useEffect(() => {
    const handle = installLabDock({ src: '/Lab.html' });
    return () => {
      handle.destroy();
    };
  }, []);

  return null;
}
