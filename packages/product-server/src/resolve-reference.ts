import type { ProductRef } from './reference';
import type { ProductChangeLog, ProductSpec, ResolvedProductReference } from './types';
import { featureKey, latestProductChange } from './version-history';

export function specSourcePath(specId: string): string {
  return `${specId.replaceAll('.', '/')}/spec.json`;
}

export function resolveProductReferenceFromSpecs(
  specs: readonly ProductSpec[],
  history: ProductChangeLog,
  reference: ProductRef,
  resolvePath: (specId: string) => string = specSourcePath,
): ResolvedProductReference | undefined {
  for (const spec of specs) {
    const entry = spec.references.find((item) => item.id === reference);
    if (!entry) continue;
    return {
      id: entry.id,
      title: entry.title,
      module: spec.title,
      path: resolvePath(spec.id),
      markdown: entry.body,
      spec,
      productStatus: spec.views?.find((view) => view.reference === entry.id)?.productStatus
        ?? spec.rules?.find((rule) => rule.reference === entry.id)?.productStatus
        ?? spec.productStatus,
      surfaceCoverage: spec.views?.find((view) => view.reference === entry.id)?.surfaceCoverage
        ?? spec.rules?.find((rule) => rule.reference === entry.id)?.surfaceCoverage
        ?? spec.surfaceCoverage,
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
