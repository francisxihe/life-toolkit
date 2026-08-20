import { extractProductReference } from './resolver';
import type { ProductRef } from './reference';
import productChangeLog from '../../product-wiki/changelog.json';
import type { ProductChangeLog, ProductChangeLogEntry, ProductSpec, ResolvedProductReference } from './types';
import { featureKey, getProductVersionChanges, getProductVersions, latestProductChange } from './version-history';

const specificationModules = import.meta.glob('../../product-wiki/**/spec.json', { eager: true, import: 'default' });
const documentModules = import.meta.glob('../../product-wiki/**/README.md', {
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
    const document = documentModules[`../../product-wiki/${spec.document}`];
    if (typeof document !== 'string') return undefined;
    return {
      id: entry.id,
      title: entry.heading.replace(/^#+\s*/, ''),
      module: spec.title,
      path: `apps/prototype/product-wiki/${spec.document}`,
      markdown: extractProductReference(document, entry.id) || document,
      spec,
      productStatus: spec.views?.find((view) => view.reference === entry.id)?.productStatus
        ?? spec.rules?.find((rule) => rule.reference === entry.id)?.productStatus
        ?? spec.productStatus,
      prototypeCoverage: spec.views?.find((view) => view.reference === entry.id)?.prototypeCoverage
        ?? spec.rules?.find((rule) => rule.reference === entry.id)?.prototypeCoverage
        ?? spec.prototypeCoverage,
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

export function findProductReferenceForElement(element: Element) {
  return findProductReferenceTargetForElement(element)?.productReference;
}

export function findProductReferenceTargetForElement(element: Element) {
  let candidate: Element | null = element;
  while (candidate) {
    const reference = candidate.getAttribute('data-product-ref');
    const productReference = reference ? resolveProductReference(reference as ProductRef) : undefined;
    if (productReference) return { element: candidate, productReference };
    candidate = candidate.parentElement;
  }
  return undefined;
}
