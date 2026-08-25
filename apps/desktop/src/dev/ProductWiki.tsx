import '@sue/design-web-react/dist/sue.css';
import { bootstrapProductInspectorPanel } from '@ylib/product-server/inspector/panel';
import type { ProductWikiData } from '@ylib/product-server';
import { productWiki } from '@true-north/product-wiki/data';

function mediaTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

const inspector = bootstrapProductInspectorPanel({
  wiki: productWiki as ProductWikiData,
  theme: mediaTheme(),
});
const media = window.matchMedia('(prefers-color-scheme: dark)');
const onThemeChange = () => inspector.setTheme(mediaTheme());
media.addEventListener('change', onThemeChange);
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    media.removeEventListener('change', onThemeChange);
    inspector.destroy();
  });
}
