import type { ProductRef } from './reference';
import { collectProductRefsForRoute } from './route-refs';
import { resolveProductReferenceFromSpecs } from './resolve-reference';
import type { ProductChangeLog, ProductChangeLogEntry, ProductSpec, ProductWikiData, ResolvedProductReference } from './types';
import { getProductVersionChanges, getProductVersions } from './version-history';

export type WikiRuntime = {
  productSpecs: readonly ProductSpec[];
  productSpecsById: Map<string, ProductSpec>;
  productHistory: ProductChangeLog;
  productVersions: readonly string[];
  productVersionChanges: (version: string) => readonly ProductChangeLogEntry[];
  productEnumValues: (moduleId: string, entityId: string, fieldId: string) => readonly string[];
  resolveProductRefsForRoute: (route: string, visibleRefs?: readonly string[]) => ProductRef[];
  resolveProductReference: (reference: ProductRef) => ResolvedProductReference | undefined;
};

export function createWikiRuntime(wiki: ProductWikiData): WikiRuntime {
  const productSpecs = wiki.specs;
  const productSpecsById = new Map(productSpecs.map((spec) => [spec.id, spec]));
  const productHistory = wiki.history;
  const productVersions = getProductVersions(productHistory);

  return {
    productSpecs,
    productSpecsById,
    productHistory,
    productVersions,
    productVersionChanges: (version) => getProductVersionChanges(productHistory, version),
    productEnumValues: (moduleId, entityId, fieldId) =>
      productSpecsById.get(moduleId)?.entities?.find((entity) => entity.id === entityId)?.fields.find((field) => field.id === fieldId)?.values || [],
    resolveProductRefsForRoute: (route, visibleRefs) => collectProductRefsForRoute(productSpecs, route, visibleRefs),
    resolveProductReference: (reference) => resolveProductReferenceFromSpecs(productSpecs, productHistory, reference),
  };
}
