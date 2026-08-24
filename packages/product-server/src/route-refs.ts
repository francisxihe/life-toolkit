import type { ProductRef } from './reference';
import type { ProductSpec } from './types';

export function matchDesktopRoute(pattern: string, path: string): boolean {
  const patternParts = pattern.split('/');
  const pathParts = path.split('/');
  if (patternParts.length !== pathParts.length) return false;
  return patternParts.every((part, index) => part.startsWith(':') || part === pathParts[index]);
}

function uniqueRefs(values: readonly string[]): ProductRef[] {
  const refs: ProductRef[] = [];
  const seen = new Set<string>();
  for (const value of values) {
    if (!value || seen.has(value)) continue;
    seen.add(value);
    refs.push(value);
  }
  return refs;
}

function moduleOverviewRef(spec: ProductSpec): ProductRef | undefined {
  const overview =
    spec.references.find((item) => item.id === `${spec.id}.overview`) || spec.references[0];
  return overview?.id;
}

export function collectProductRefsForRoute(
  specs: readonly ProductSpec[],
  route: string,
  visibleRefs?: readonly string[],
): ProductRef[] {
  const views: string[] = [];
  for (const spec of specs) {
    for (const view of spec.views || []) {
      if (view.productStatus === 'deprecated') continue;
      if (!matchDesktopRoute(view.desktopRoute, route)) continue;
      views.push(view.reference);
    }
  }

  const uniqueViews = uniqueRefs(views);
  if (visibleRefs?.length) {
    const viewSet = new Set<string>(uniqueViews);
    const present = uniqueRefs(visibleRefs.filter((reference) => viewSet.has(reference)));
    if (present.length) return present;
  }
  if (uniqueViews.length) return uniqueViews;

  let best: ProductSpec | undefined;
  for (const spec of specs) {
    if (!spec.route) continue;
    if (route !== spec.route && !route.startsWith(`${spec.route}/`)) continue;
    if (!best || spec.route.length > (best.route?.length || 0)) best = spec;
  }
  const fallback = best ? moduleOverviewRef(best) : undefined;
  return fallback ? [fallback] : [];
}
