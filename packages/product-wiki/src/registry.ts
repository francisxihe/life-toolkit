import type { ProductRef } from './reference';
import { collectProductRefsForRoute } from './route-refs';
import { resolveProductReferenceFromSpecs } from './resolve-reference';
import productChangeLog from '../wiki/changelog.json';
import type { ProductChangeLog, ProductChangeLogEntry, ProductSpec, ResolvedProductReference } from './types';
import { getProductVersionChanges, getProductVersions } from './version-history';

const specificationModules = import.meta.glob('../wiki/**/spec.json', { eager: true, import: 'default' });

export const productSpecs = Object.values(specificationModules) as ProductSpec[];
export const productSpecsById = new Map(productSpecs.map((spec) => [spec.id, spec]));
export const productHistory = productChangeLog as ProductChangeLog;
export const productVersions = getProductVersions(productHistory);

export { specSourcePath, resolveProductReferenceFromSpecs } from './resolve-reference';

export function productVersionChanges(version: string): readonly ProductChangeLogEntry[] {
  return getProductVersionChanges(productHistory, version);
}

export function productEnumValues(moduleId: string, entityId: string, fieldId: string): readonly string[] {
  return productSpecsById.get(moduleId)?.entities?.find((entity) => entity.id === entityId)?.fields.find((field) => field.id === fieldId)?.values || [];
}

export function resolveProductRefsForRoute(route: string, visibleRefs?: readonly string[]): ProductRef[] {
  return collectProductRefsForRoute(productSpecs, route, visibleRefs);
}

export function resolveProductReference(reference: ProductRef): ResolvedProductReference | undefined {
  return resolveProductReferenceFromSpecs(productSpecs, productHistory, reference);
}
