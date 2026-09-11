import type { DataSource, EntityMetadata, TableColumn } from 'typeorm';

function sqliteType(column: TableColumn | EntityMetadata['columns'][number]): string {
  const type = String('type' in column ? column.type : 'varchar').toLowerCase();
  if (type.includes('int')) return 'integer';
  if (type.includes('float') || type.includes('double') || type.includes('real') || type.includes('numeric') || type.includes('decimal')) {
    return 'real';
  }
  if (type.includes('bool')) return 'integer';
  return 'text';
}

export async function ensureEntitySchema(dataSource: DataSource): Promise<void> {
  for (const meta of dataSource.entityMetadatas) {
    const tableName = meta.tableName;
    const tables: Array<{ name: string }> = await dataSource.query(
      `SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?`,
      [tableName],
    );
    if (!tables.length) {
      const primaryCols = meta.columns.filter((column) => column.isPrimary);
      const columns = meta.columns.map((column) => {
        const parts = [`"${column.databaseName}" ${sqliteType(column as never)}`];
        if (column.isPrimary && primaryCols.length === 1) parts.push('PRIMARY KEY');
        if (!column.isNullable && !column.isPrimary) parts.push('NOT NULL');
        return parts.join(' ');
      });
      if (primaryCols.length > 1) {
        columns.push(`PRIMARY KEY (${primaryCols.map((column) => `"${column.databaseName}"`).join(', ')})`);
      }
      await dataSource.query(`CREATE TABLE IF NOT EXISTS "${tableName}" (${columns.join(', ')})`);
      continue;
    }
    const existing: Array<{ name: string }> = await dataSource.query(`PRAGMA table_info('${tableName}')`);
    const existingNames = new Set(existing.map((column) => column.name));
    for (const column of meta.columns) {
      if (existingNames.has(column.databaseName)) continue;
      const nullable = column.isNullable || column.isPrimary ? '' : ' NOT NULL';
      await dataSource.query(
        `ALTER TABLE "${tableName}" ADD COLUMN "${column.databaseName}" ${sqliteType(column as never)}${nullable}`,
      );
    }
  }
}
