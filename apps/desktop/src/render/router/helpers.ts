const mod = import.meta.glob('../pages/**/*.tsx');

/**
 * 移除路径中的动态路由参数
 * @param path 原始路径，如 '/growth/goal/detail/:id'
 * @returns 处理后的路径，如 '/growth/goal/detail'
 */
function removeDynamicParams(path: string): string {
  return path
    .split('/')
    .filter((segment) => !segment.startsWith(':'))
    .join('/');
}

/**
 * 获取组件模块
 * @param key 路由键，支持动态路由参数
 * @returns 组件模块
 */
export function getComponentModule(key: string) {
  if (!/^\//.test(key)) {
    key = `/${key}`;
  }

  // 移除动态路由参数，获取实际的组件路径
  const componentPath = removeDynamicParams(key);

  // 尝试匹配 index.tsx 文件
  if (mod[`../pages${componentPath}/index.tsx`]) {
    return mod[`../pages${componentPath}/index.tsx`];
  }
  // 尝试匹配直接的 .tsx 文件
  else if (mod[`../pages${componentPath}.tsx`]) {
    return mod[`../pages${componentPath}.tsx`];
  }

  throw new Error(`Component ${key} not found (resolved to: ${componentPath})`);
}
