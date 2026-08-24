import '@sue/design-web-react/dist/sue.css';
import { bootstrapProductInspectorPanel } from '@true-north/product-server/inspector/panel';
import type { ProductWikiData } from '@true-north/product-server';
import { productWiki } from '@true-north/product-wiki/data';

const inspector = bootstrapProductInspectorPanel({ wiki: productWiki as ProductWikiData });
if (import.meta.hot) import.meta.hot.dispose(inspector.destroy);
