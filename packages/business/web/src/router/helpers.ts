const mod = import.meta.glob('../pages/**/[a-z[]*.tsx');

export function getComponentModule(key: string) {
  if (!/^\//.test(key)) {
    key = `/${key}`;
  }
  if (mod[`../pages${key}/index.tsx`]) {
    return mod[`../pages${key}/index.tsx`];
  } else if (mod[`../pages${key}.tsx`]) {
    return mod[`../pages${key}.tsx`];
  }
  throw new Error(`Component ${key} not found`);
}
