import type { ProductRef } from './reference';
import type { ProductChangeLog, ProductSpec, ResolvedProductReference } from './types';
import { featureKey, latestProductChange } from './version-history';

export function productBreadcrumb(spec: ProductSpec, reference: string): string[] {
  const view = spec.views?.find((item) => item.reference === reference);
  if (view) return [spec.title, view.name];
  const rule = spec.rules?.find((item) => item.reference === reference);
  if (rule) return [spec.title, rule.name];
  for (const entity of spec.entities || []) {
    if (reference === `${spec.id}.${entity.id}`) return [spec.title, entity.name];
    for (const field of entity.fields) {
      if (reference === `${spec.id}.${entity.id}.${field.id}`) return [spec.title, entity.name, field.name];
    }
  }
  const entry = spec.references.find((item) => item.id === reference);
  if (entry && entry.title !== spec.title) return [spec.title, entry.title];
  return [spec.title];
}

export function resolveProductReferenceFromSpecs(
  specs: readonly ProductSpec[],
  history: ProductChangeLog,
  reference: ProductRef,
): ResolvedProductReference | undefined {
  for (const spec of specs) {
    const entry = spec.references.find((item) => item.id === reference);
    if (!entry) continue;
    const view = spec.views?.find((item) => item.reference === entry.id);
    const rule = spec.rules?.find((item) => item.reference === entry.id);
    return {
      id: entry.id,
      title: entry.title,
      module: spec.title,
      breadcrumb: productBreadcrumb(spec, entry.id),
      markdown: entry.body,
      spec,
      productStatus: view?.productStatus ?? rule?.productStatus ?? spec.productStatus,
      surfaceCoverage: view?.surfaceCoverage ?? rule?.surfaceCoverage ?? spec.surfaceCoverage,
      latestChange: latestProductChange(history, featureKeysForReference(spec, entry.id)),
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
