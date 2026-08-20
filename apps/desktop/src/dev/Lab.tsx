import { bootstrapLabPanel } from '@true-north/dev-lab/panel';

const lab = bootstrapLabPanel();
if (import.meta.hot) import.meta.hot.dispose(lab.destroy);
