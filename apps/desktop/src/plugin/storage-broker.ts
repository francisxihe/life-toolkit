import { getPluginHost, getPluginHostOptional } from './active-host';

export function getHostDatabasePath() {
  return getPluginHost().getHostDatabasePath();
}

export async function closeDatabase() {
  await getPluginHostOptional()?.closeDatabase();
}

export const AppDataSource = new Proxy({} as import('typeorm').DataSource, {
  get(_target, prop, receiver) {
    const dataSource = getPluginHost().dataSource;
    if (!dataSource) throw new Error('Host database is not open');
    const value = Reflect.get(dataSource, prop, receiver);
    return typeof value === 'function' ? value.bind(dataSource) : value;
  },
});
