import '@sue/design-web-react/dist/sue.css';
import { bootstrapProductInspectorPanel } from '@true-north/product-wiki/inspector/panel';

const inspector = bootstrapProductInspectorPanel();
if (import.meta.hot) import.meta.hot.dispose(inspector.destroy);
