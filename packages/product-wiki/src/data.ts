import { productHistory, productSpecs } from './catalog.generated';

export function specSourcePath(specId: string): string {
  return `packages/product-wiki/wiki/${specId.replaceAll('.', '/')}/spec.json`;
}

export const productWiki = {
  specs: productSpecs,
  history: productHistory,
  specSourcePath,
};

export { productHistory, productSpecs };
