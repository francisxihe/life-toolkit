import { extractProductReference } from './resolver';
import type { ProductRef } from './reference';
import productChangeLog from '../wiki/changelog.json';
import type { ProductChangeLog, ProductChangeLogEntry, ProductSpec, ResolvedProductReference } from './types';
import { featureKey, getProductVersionChanges, getProductVersions, latestProductChange } from './version-history';

const specificationModules = import.meta.glob('../wiki/**/spec.json', { eager: true, import: 'default' });
const documentModules = import.meta.glob('../wiki/**/README.md', {
  eager: true,
  query: '?raw',
  import: 'default',
});

export const productSpecs = Object.values(specificationModules) as ProductSpec[];
export const productSpecsById = new Map(productSpecs.map((spec) => [spec.id, spec]));
export const productHistory = productChangeLog as ProductChangeLog;
export const productVersions = getProductVersions(productHistory);

export function productVersionChanges(version: string): readonly ProductChangeLogEntry[] {
  return getProductVersionChanges(productHistory, version);
}

export function productEnumValues(moduleId: string, entityId: string, fieldId: string): readonly string[] {
  return productSpecsById.get(moduleId)?.entities?.find((entity) => entity.id === entityId)?.fields.find((field) => field.id === fieldId)?.values || [];
}

export function resolveProductReference(reference: ProductRef): ResolvedProductReference | undefined {
  for (const spec of productSpecs) {
    const entry = spec.references.find((item) => item.id === reference);
    if (!entry) continue;
    const document = documentModules[`../wiki/${spec.document}`];
    if (typeof document !== 'string') return undefined;
    return {
      id: entry.id,
      title: entry.heading.replace(/^#+\s*/, ''),
      module: spec.title,
      path: `packages/product-wiki/wiki/${spec.document}`,
      markdown: extractProductReference(document, entry.id) || document,
      spec,
      productStatus: spec.views?.find((view) => view.reference === entry.id)?.productStatus
        ?? spec.rules?.find((rule) => rule.reference === entry.id)?.productStatus
        ?? spec.productStatus,
      surfaceCoverage: spec.views?.find((view) => view.reference === entry.id)?.surfaceCoverage
        ?? spec.rules?.find((rule) => rule.reference === entry.id)?.surfaceCoverage
        ?? spec.surfaceCoverage,
      latestChange: latestProductChange(productHistory, featureKeysForReference(spec, entry.id)),
    };
  }
  return undefined;
}

function featureKeysForReference(specification: ProductSpec, reference: string): readonly string[] {
  const view = specification.views?.find((item) => item.reference === reference);
  if (view) return [featureKey(specification.id, 'view', view.id)];
  const rule = specification.rules?.find((item) => item.reference === reference);
  if (rule) return [featureKey(specification.id, 'rule', rule.id)];
  return [featureKey(specification.id, 'module', specification.id)];
}
