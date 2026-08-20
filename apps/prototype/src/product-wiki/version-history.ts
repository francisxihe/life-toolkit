import type { ProductChangeLog, ProductChangeLogEntry, ProductFeatureScope, ProductSpec } from './types';

export function featureKey(moduleId: string, scope: ProductFeatureScope, localPath: string) {
  return `${moduleId}:${scope}:${localPath}`;
}

export function getProductVersions(history: ProductChangeLog): readonly string[] {
  return [...new Set(history.changes.map((change) => change.version))].sort(compareVersionsDescending);
}

export function getProductVersionChanges(history: ProductChangeLog, version: string): readonly ProductChangeLogEntry[] {
  return history.changes
    .filter((change) => change.version === version)
    .slice()
    .sort((left, right) => left.feature.moduleTitle.localeCompare(right.feature.moduleTitle, 'zh-CN') || left.date.localeCompare(right.date) || left.feature.name.localeCompare(right.feature.name, 'zh-CN'));
}

export function latestProductChange(history: ProductChangeLog, keys: readonly string[]): ProductChangeLogEntry | undefined {
  const keySet = new Set(keys);
  return history.changes.reduce<ProductChangeLogEntry | undefined>((latest, change) => {
    if (!keySet.has(change.feature.key)) return latest;
    if (!latest || latest.date < change.date || (latest.date === change.date && compareVersions(change.version, latest.version) > 0)) return change;
    return latest;
  }, undefined);
}

export type ActiveProductFeature = { key: string; productStatus: string; prototypeCoverage: string };

export function listActiveProductFeatures(specifications: readonly ProductSpec[]): readonly ActiveProductFeature[] {
  return specifications.flatMap((specification) => [
    { key: featureKey(specification.id, 'module', specification.id), productStatus: specification.productStatus, prototypeCoverage: specification.prototypeCoverage },
    ...(specification.entities || []).flatMap((entity) => [
      { key: featureKey(specification.id, 'entity', entity.id), productStatus: entity.productStatus, prototypeCoverage: entity.prototypeCoverage },
      ...entity.fields.map((field) => ({ key: featureKey(specification.id, 'field', `${entity.id}.${field.id}`), productStatus: field.productStatus, prototypeCoverage: field.prototypeCoverage })),
    ]),
    ...(specification.views || []).map((view) => ({ key: featureKey(specification.id, 'view', view.id), productStatus: view.productStatus, prototypeCoverage: view.prototypeCoverage })),
    ...(specification.rules || []).map((rule) => ({ key: featureKey(specification.id, 'rule', rule.id), productStatus: rule.productStatus, prototypeCoverage: rule.prototypeCoverage })),
  ]);
}

function compareVersionsDescending(left: string, right: string) {
  return compareVersions(right, left);
}

function compareVersions(left: string, right: string) {
  const leftParts = left.slice(1).split('.').map(Number);
  const rightParts = right.slice(1).split('.').map(Number);
  for (let index = 0; index < 3; index += 1) {
    if (leftParts[index] !== rightParts[index]) return leftParts[index] - rightParts[index];
  }
  return 0;
}
