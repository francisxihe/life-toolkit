/**
 * 转义正则表达式特殊字符
 */
export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 将类型名转换为服务常量名
 */
export function typeToServiceConstName(type: string): string {
  if (type.endsWith('Service')) {
    const base = type.slice(0, -7); // remove "Service"
    return base.charAt(0).toLowerCase() + base.slice(1) + 'Service';
  }
  return type.charAt(0).toLowerCase() + type.slice(1);
}
