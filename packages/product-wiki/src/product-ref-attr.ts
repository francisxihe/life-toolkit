import type { ProductRef } from './reference';

export type ProductSurfaceHostProps = {
  'data-product-ref'?: string;
};

export function parseProductRefAttribute(value: string | null | undefined): ProductRef[] {
  if (!value) return [];
  const refs: ProductRef[] = [];
  const seen = new Set<string>();
  for (const part of value.trim().split(/\s+/)) {
    if (!part || seen.has(part)) continue;
    seen.add(part);
    refs.push(part as ProductRef);
  }
  return refs;
}

export function mergeProductRefAttribute(existing: unknown, id: ProductRef): string {
  const current = typeof existing === 'string' ? parseProductRefAttribute(existing) : [];
  if (current.includes(id)) return current.join(' ');
  return [...current, id].join(' ');
}
