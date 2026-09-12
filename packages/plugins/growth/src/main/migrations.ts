import { HabitStatus, TaskStatus, TodoRelatedType, TodoRepeatStatus } from '@true-north/enum';
import { randomUUID } from 'crypto';
import type { PluginStorageHandle } from '@true-north/plugin-sdk/main';

type Query = PluginStorageHandle['query'];

async function tableNames(query: Query): Promise<Set<string>> {
  const tables = (await query(
    "SELECT name FROM sqlite_master WHERE type = 'table'",
  )) as Array<{ name: string }>;
  return new Set((tables || []).map((table) => table.name));
}

async function columnNames(query: Query, table: string): Promise<Set<string>> {
  const columns = (await query(`PRAGMA table_info('${table}')`)) as Array<{ name: string }>;
  return new Set((columns || []).map((column) => column.name));
}

export const growthMigrations = [
  {
    id: 'growth.v1.repair-legacy-enums',
    version: 1,
    async up(storage: PluginStorageHandle) {
      const names = await tableNames(storage.query);
      if (names.has('task')) {
        await storage.query(`UPDATE task SET status = '${TaskStatus.TODO}' WHERE status IS NULL OR status = ''`);
      }
      if (names.has('goal')) {
        await storage.query('PRAGMA ignore_check_constraints = ON');
        await storage.query("UPDATE goal SET type = 'vision' WHERE type = 'objective'");
        await storage.query("UPDATE goal SET type = 'result' WHERE type = 'key_result'");
        await storage.query('PRAGMA ignore_check_constraints = OFF');
      }
      if (names.has('habit')) {
        await storage.query('PRAGMA ignore_check_constraints = ON');
        await storage.query(
          "UPDATE habit SET status = 'active' WHERE status IN ('todo', 'doing') OR status IS NULL OR status = ''",
        );
        await storage.query(`UPDATE habit SET status = '${HabitStatus.COMPLETED}' WHERE status = 'done'`);
        await storage.query('PRAGMA ignore_check_constraints = OFF');
      }
      if (names.has('todo')) {
        await storage.query(
          `UPDATE todo SET related_type = '${TodoRelatedType.NONE}' WHERE related_type = 'manual' OR related_type IS NULL OR related_type = ''`,
        );
        const columns = await columnNames(storage.query, 'todo');
        if (columns.has('related_type') && columns.has('related_id')) {
          if (columns.has('task_id')) {
            await storage.query(
              `UPDATE todo SET related_type = '${TodoRelatedType.TASK}', related_id = task_id WHERE task_id IS NOT NULL AND task_id != '' AND (related_id IS NULL OR related_id = '')`,
            );
          }
          if (columns.has('habit_id')) {
            await storage.query(
              `UPDATE todo SET related_type = '${TodoRelatedType.HABIT}', related_id = habit_id WHERE habit_id IS NOT NULL AND habit_id != '' AND (related_id IS NULL OR related_id = '')`,
            );
          }
          if (columns.has('repeat_id')) {
            await storage.query(
              `UPDATE todo SET related_type = '${TodoRelatedType.REPEAT}', related_id = repeat_id WHERE repeat_id IS NOT NULL AND repeat_id != '' AND (related_id IS NULL OR related_id = '')`,
            );
          }
          await storage.query(
            `UPDATE todo SET related_type = '${TodoRelatedType.NONE}', related_id = NULL WHERE related_type IN ('${TodoRelatedType.TASK}','${TodoRelatedType.HABIT}','${TodoRelatedType.REPEAT}','${TodoRelatedType.GOAL}') AND (related_id IS NULL OR related_id = '')`,
          );
        }
      }
    },
  },
  {
    id: 'growth.v2.normalize-estimates',
    version: 2,
    async up(storage: PluginStorageHandle) {
      const names = await tableNames(storage.query);
      if (names.has('task')) {
        await storage.query(
          "UPDATE task SET estimate_time = NULL WHERE estimate_time IS NOT NULL AND CAST(estimate_time AS TEXT) GLOB '*[^0-9]*'",
        );
      }
      if (names.has('todo')) {
        await storage.query("UPDATE todo SET status = 'todo' WHERE status = 'in_progress'");
      }
    },
  },
  {
    id: 'growth.v3.repair-object-titles',
    version: 3,
    async up(storage: PluginStorageHandle) {
      const names = await tableNames(storage.query);
      if (!names.has('todo')) return;
      await storage.query("UPDATE todo SET name = '待补充待办' WHERE name = '[object Object]'");
    },
  },
  {
    id: 'growth.v4.related-ids',
    version: 4,
    async up(storage: PluginStorageHandle) {
      const names = await tableNames(storage.query);
      if (!names.has('todo')) return;
      const columns = await columnNames(storage.query, 'todo');
      if (!columns.has('related_type') || !columns.has('related_id')) return;
      if (columns.has('task_id')) {
        await storage.query(
          `UPDATE todo SET related_type = '${TodoRelatedType.TASK}', related_id = task_id WHERE task_id IS NOT NULL AND task_id != '' AND (related_id IS NULL OR related_id = '')`,
        );
      }
      if (columns.has('habit_id')) {
        await storage.query(
          `UPDATE todo SET related_type = '${TodoRelatedType.HABIT}', related_id = habit_id WHERE habit_id IS NOT NULL AND habit_id != '' AND (related_id IS NULL OR related_id = '')`,
        );
      }
      if (columns.has('repeat_id')) {
        await storage.query(
          `UPDATE todo SET related_type = '${TodoRelatedType.REPEAT}', related_id = repeat_id WHERE repeat_id IS NOT NULL AND repeat_id != '' AND (related_id IS NULL OR related_id = '')`,
        );
      }
      await storage.query(
        `UPDATE todo SET related_type = '${TodoRelatedType.NONE}', related_id = NULL WHERE related_type IN ('${TodoRelatedType.TASK}','${TodoRelatedType.HABIT}','${TodoRelatedType.REPEAT}','${TodoRelatedType.GOAL}') AND (related_id IS NULL OR related_id = '')`,
      );
    },
  },
  {
    id: 'growth.v5.split-todo-repeat',
    version: 5,
    async up(storage: PluginStorageHandle) {
      const names = await tableNames(storage.query);
      if (!names.has('todo_repeat') || !names.has('repeat_todo') || !names.has('repeat')) return;
      const legacyRows = (await storage.query(
        `SELECT * FROM todo_repeat WHERE deleted_at IS NULL`,
      )) as Array<Record<string, unknown>>;
      if (!legacyRows.length) {
        await storage.query(`DROP TABLE IF EXISTS todo_repeat`);
        return;
      }
      const existing = (await storage.query(`SELECT id FROM repeat_todo`)) as Array<{ id: string }>;
      const existingIds = new Set((existing || []).map((row) => row.id));
      for (const row of legacyRows) {
        const id = String(row.id);
        if (existingIds.has(id)) continue;
        const repeatId = randomUUID();
        const legacyStatus = String(row.status || 'todo');
        const status =
          legacyStatus === 'abandoned'
            ? TodoRepeatStatus.ABANDONED
            : legacyStatus === 'todo'
              ? TodoRepeatStatus.ACTIVE
              : TodoRepeatStatus.ENDED;
        const repeatConfig =
          row.repeat_config == null
            ? null
            : typeof row.repeat_config === 'string'
              ? row.repeat_config
              : JSON.stringify(row.repeat_config);
        await storage.query(
          `INSERT INTO repeat (
            id, created_at, updated_at, deleted_at,
            repeat_mode, repeat_config, repeat_end_mode, repeat_end_date, repeat_times, repeat_start_date, current_date
          ) VALUES (?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?)`,
          [
            repeatId,
            row.created_at || new Date().toISOString(),
            row.updated_at || new Date().toISOString(),
            row.repeat_mode,
            repeatConfig,
            row.repeat_end_mode,
            row.repeat_end_date ?? null,
            row.repeat_times ?? null,
            row.repeat_start_date ?? null,
            row.current_date ?? row.repeat_start_date ?? null,
          ],
        );
        await storage.query(
          `INSERT INTO repeat_todo (
            id, created_at, updated_at, deleted_at,
            name, description, importance, urgency, plan_start_time, plan_end_time, status, abandoned_at, repeat_id
          ) VALUES (?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            row.created_at || new Date().toISOString(),
            row.updated_at || new Date().toISOString(),
            row.name ?? null,
            row.description ?? null,
            row.importance ?? null,
            row.urgency ?? null,
            row.plan_start_time ?? null,
            row.plan_end_time ?? null,
            status,
            row.abandoned_at ?? null,
            repeatId,
          ],
        );
        await storage.query(
          `UPDATE todo SET related_type = '${TodoRelatedType.REPEAT}', related_id = ? WHERE related_type = '${TodoRelatedType.REPEAT}' AND (related_id IS NULL OR related_id = '') AND name = ?`,
          [id, row.name],
        );
      }
      await storage.query(`DROP TABLE IF EXISTS todo_repeat`);
    },
  },
];
