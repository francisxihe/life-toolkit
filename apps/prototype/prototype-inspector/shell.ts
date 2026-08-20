import '@sue/design-web-react/dist/sue.css';
import { bootstrapPrototypeInspector } from './index';

const inspector = bootstrapPrototypeInspector();
if (import.meta.hot) import.meta.hot.dispose(inspector.destroy);
