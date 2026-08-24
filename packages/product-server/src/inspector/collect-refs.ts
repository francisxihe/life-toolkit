import { parseProductRefAttribute } from '../product-ref-attr';
import type { ProductRef } from '../reference';

export function findProductRefHost(element: Element): Element {
  let candidate: Element | null = element;
  while (candidate) {
    if (parseProductRefAttribute(candidate.getAttribute('data-product-ref')).length) return candidate;
    candidate = candidate.parentElement;
  }
  return element;
}

export function collectProductRefsFromElement(element: Element): ProductRef[] {
  const refs: ProductRef[] = [];
  const seen = new Set<string>();
  let candidate: Element | null = element;
  while (candidate) {
    for (const reference of parseProductRefAttribute(candidate.getAttribute('data-product-ref'))) {
      if (seen.has(reference)) continue;
      seen.add(reference);
      refs.push(reference);
    }
    candidate = candidate.parentElement;
  }
  return refs;
}
