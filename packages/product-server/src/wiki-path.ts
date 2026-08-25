import { childProductSpecs } from './export/format';
import type { ProductRef } from './reference';
import { specOverviewRef } from './route-refs';
import type { ProductSpec, ProductViewSpec } from './types';

export type WikiPathFocus = 'spec' | 'reference';

export type WikiPathSibling = {
  id: string;
  title: string;
  kind: 'spec' | 'view';
};

export type WikiPathLevel = {
  key: string;
  title: string;
  currentId: string;
  kind: 'spec' | 'reference';
  siblings: WikiPathSibling[];
};

function specAncestors(specsById: Map<string, ProductSpec>, spec: ProductSpec): ProductSpec[] {
  const chain: ProductSpec[] = [];
  const seen = new Set<string>();
  let current: ProductSpec | undefined = spec;
  while (current && !seen.has(current.id)) {
    seen.add(current.id);
    chain.unshift(current);
    current = current.parentId ? specsById.get(current.parentId) : undefined;
  }
  return chain.filter((item) => item.kind !== 'global' && item.parentId);
}

export function specNavViews(spec: ProductSpec): ProductViewSpec[] {
  return (spec.views || []).filter((view) => view.productStatus !== 'deprecated');
}

function specDrillItems(specs: readonly ProductSpec[], spec: ProductSpec): WikiPathSibling[] {
  const children = childProductSpecs(specs, spec.id);
  if (children.length) {
    return children.map((child) => ({ id: child.id, title: child.title, kind: 'spec' }));
  }
  return specNavViews(spec).map((view) => ({ id: view.reference, title: view.name, kind: 'view' }));
}

function documentTitle(spec: ProductSpec, reference: string, entryTitle: string): string {
  const view = specNavViews(spec).find((item) => item.reference === reference);
  return view?.name || entryTitle;
}

export function wikiBreadcrumbPath(
  specs: readonly ProductSpec[],
  spec: ProductSpec,
  reference: string,
  focus: WikiPathFocus = 'reference',
): WikiPathLevel[] {
  const specsById = new Map(specs.map((item) => [item.id, item]));
  const ancestors = specAncestors(specsById, spec);
  const levels: WikiPathLevel[] = ancestors.map((item) => ({
    key: item.id,
    title: item.title,
    currentId: item.id,
    kind: 'spec',
    siblings: specDrillItems(specs, item),
  }));
  if (focus !== 'spec') {
    const entry = spec.references.find((item) => item.id === reference);
    if (entry) {
      levels.push({
        key: entry.id,
        title: documentTitle(spec, entry.id, entry.title),
        currentId: entry.id,
        kind: 'reference',
        siblings: [],
      });
    }
  }
  if (levels.length) levels[levels.length - 1] = { ...levels[levels.length - 1], siblings: [] };
  return levels;
}

export function wikiPathNavigateRef(
  specs: readonly ProductSpec[],
  specsById: Map<string, ProductSpec>,
  level: WikiPathLevel,
  siblingId: string,
): ProductRef | undefined {
  const item = level.siblings.find((sibling) => sibling.id === siblingId);
  if (item?.kind === 'view') return siblingId;
  const spec = specsById.get(siblingId) || specs.find((candidate) => candidate.id === siblingId);
  return spec ? specOverviewRef(spec) : undefined;
}
