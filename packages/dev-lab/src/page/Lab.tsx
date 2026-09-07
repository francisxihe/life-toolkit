import '@sue/design-web-react/dist/sue.css';
import { bootstrapLabPanel } from '../panel';

const lab = bootstrapLabPanel();
if (import.meta.hot) import.meta.hot.dispose(lab.destroy);
