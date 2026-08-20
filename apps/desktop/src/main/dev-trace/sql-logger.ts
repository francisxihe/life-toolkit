import type { Logger, QueryRunner } from 'typeorm';
import { isDevTraceEnabled, recordSql } from '@true-north/dev-lab/collector';

export class DevTraceTypeormLogger implements Logger {
  logQuery(query: string, parameters?: any[], _queryRunner?: QueryRunner): void {
    if (!isDevTraceEnabled()) return;
    recordSql({ query, parameters });
  }

  logQueryError(error: string | Error, query: string, parameters?: any[], _queryRunner?: QueryRunner): void {
    if (!isDevTraceEnabled()) return;
    recordSql({
      query,
      parameters,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  logQuerySlow(time: number, query: string, parameters?: any[], _queryRunner?: QueryRunner): void {
    if (!isDevTraceEnabled()) return;
    recordSql({ query, parameters, durationMs: time });
  }

  logSchemaBuild(): void {}

  logMigration(): void {}

  log(): void {}
}

export function createDevTraceTypeormLogger(): Logger | undefined {
  if (!isDevTraceEnabled()) return undefined;
  return new DevTraceTypeormLogger();
}
