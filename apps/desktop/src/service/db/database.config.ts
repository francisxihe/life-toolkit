import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { app } from 'electron';
import path from 'path';
import sqlite3 from 'sqlite3';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { HabitStatus, TaskStatus, TodoRelatedType, TodoRepeatStatus } from '@true-north/enum';
import { randomUUID } from 'crypto';
import { User } from '../users/user.entity';
import { Goal } from '../growth/goal/goal.entity';
import { Habit } from '../growth/habit/habit.entity';
import { Task } from '../growth/task/task.entity';
import { Todo } from '../growth/todo/todo.entity';
import { TodoRepeat } from '../growth/todo/todo-repeat.entity';
import { Repeat } from '../growth/repeat/repeat.entity';
import { TrackTime } from '../growth/track-time/entity';
import { AiRun } from '../ai/run/ai-run.entity';
import { AiSuggestionCache } from '../ai/cache/ai-suggestion-cache.entity';

const getDatabasePath = () => {
  if (process.env.NODE_ENV === 'development') {
    return path.join(process.cwd(), 'database.sqlite');
  } else {
    try {
      return path.join(app.getPath('userData'), 'true-north.db');
    } catch (error) {
      return path.join(process.cwd(), 'true-north.db');
    }
  }
};

const databasePath = getDatabasePath();

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: databasePath,
  synchronize: true,
  logging: process.env.NODE_ENV === 'development' ? ['error'] : undefined,
  entities: [User, Goal, Task, Todo, TodoRepeat, Repeat, Habit, TrackTime, AiRun, AiSuggestionCache],
  migrations: [],
  subscribers: [],
  namingStrategy: new SnakeNamingStrategy(),
});

export const initializeDatabase = async (): Promise<void> => {
  try {
    if (!AppDataSource.isInitialized) {
      await repairGrowthV010BeforeSynchronize();
      await AppDataSource.initialize();
      await migrateGrowthV010();
      await migrateGrowthV011();
      await migrateGrowthRepeatRefactor();
      await migrateTodoRepeatToRepeatTodo();
      console.log('数据库连接已建立', databasePath);
    }
  } catch (error) {
    console.error('数据库连接失败:', error);
    throw error;
  }
};

/**
 * TypeORM copies existing rows into a temporary table while synchronizing the
 * new Goal and Task schemas. Legacy values must be normalized before their
 * new CHECK and NOT NULL constraints are applied.
 */
async function repairGrowthV010BeforeSynchronize(): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const database = new sqlite3.Database(databasePath, (openError) => {
      if (openError) {
        reject(openError);
        return;
      }

      database.all(
        "SELECT name FROM sqlite_master WHERE type = 'table' AND name IN ('goal', 'task', 'habit', 'todo')",
        (tableError, tables: Array<{ name: string }>) => {
          if (tableError) {
            database.close(() => reject(tableError));
            return;
          }
          const tableNames = new Set(tables.map((table) => table.name));
          const updates: string[] = [];
          if (tableNames.has('task')) {
            updates.push(`UPDATE task SET status = '${TaskStatus.TODO}' WHERE status IS NULL OR status = ''`);
          }
          if (tableNames.has('goal')) {
            // Legacy tables only allow objective/key_result. Disable the old
            // CHECK while replacing those values with the v0.1.0 enum.
            updates.push('PRAGMA ignore_check_constraints = ON');
            updates.push("UPDATE goal SET type = 'vision' WHERE type = 'objective'");
            updates.push("UPDATE goal SET type = 'result' WHERE type = 'key_result'");
            updates.push('PRAGMA ignore_check_constraints = OFF');
          }
          if (tableNames.has('habit')) {
            updates.push('PRAGMA ignore_check_constraints = ON');
            updates.push("UPDATE habit SET status = 'active' WHERE status IN ('todo', 'doing') OR status IS NULL OR status = ''");
            updates.push("UPDATE habit SET status = 'completed' WHERE status = 'done'");
            updates.push('PRAGMA ignore_check_constraints = OFF');
          }
          if (tableNames.has('todo')) {
            updates.push(`UPDATE todo SET related_type = '${TodoRelatedType.NONE}' WHERE related_type = 'manual' OR related_type IS NULL OR related_type = ''`);
          }

          const finish = () => {
            if (!updates.length) {
              database.close((closeError) => (closeError ? reject(closeError) : resolve()));
              return;
            }
            database.exec(updates.join(';'), (updateError) => {
              database.close((closeError) => {
                if (updateError) reject(updateError);
                else if (closeError) reject(closeError);
                else resolve();
              });
            });
          };

          // 在 TypeORM synchronize 删列之前，把专用外键抄进 related_*
          if (!tableNames.has('todo')) {
            finish();
            return;
          }
          database.all(`PRAGMA table_info('todo')`, (pragmaError, columns: Array<{ name: string }>) => {
            if (pragmaError) {
              database.close(() => reject(pragmaError));
              return;
            }
            const columnNames = new Set(columns.map((c) => c.name));
            if (columnNames.has('related_type') && columnNames.has('related_id')) {
              if (columnNames.has('task_id')) {
                updates.push(
                  `UPDATE todo SET related_type = '${TodoRelatedType.TASK}', related_id = task_id WHERE task_id IS NOT NULL AND task_id != '' AND (related_id IS NULL OR related_id = '')`
                );
              }
              if (columnNames.has('habit_id')) {
                updates.push(
                  `UPDATE todo SET related_type = '${TodoRelatedType.HABIT}', related_id = habit_id WHERE habit_id IS NOT NULL AND habit_id != '' AND (related_id IS NULL OR related_id = '')`
                );
              }
              if (columnNames.has('repeat_id')) {
                updates.push(
                  `UPDATE todo SET related_type = '${TodoRelatedType.REPEAT}', related_id = repeat_id WHERE repeat_id IS NOT NULL AND repeat_id != '' AND (related_id IS NULL OR related_id = '')`
                );
              }
              updates.push(
                `UPDATE todo SET related_type = '${TodoRelatedType.NONE}', related_id = NULL WHERE related_type IN ('${TodoRelatedType.TASK}','${TodoRelatedType.HABIT}','${TodoRelatedType.REPEAT}','${TodoRelatedType.GOAL}') AND (related_id IS NULL OR related_id = '')`
              );
            }
            finish();
          });
        }
      );
    });
  });
}

/** v0.1.0 data migration after TypeORM schema synchronization. */
async function migrateGrowthV010(): Promise<void> {
  await AppDataSource.query(
    "UPDATE task SET estimate_time = NULL WHERE estimate_time IS NOT NULL AND CAST(estimate_time AS TEXT) GLOB '*[^0-9]*'"
  );
  await AppDataSource.query("UPDATE todo SET status = 'todo' WHERE status = 'in_progress'");
}

/** Repair titles written by the pre-migration native-event callback bug. */
async function migrateGrowthV011(): Promise<void> {
  await AppDataSource.query(
    "UPDATE todo SET name = '待补充待办' WHERE name = '[object Object]'"
  );
}

/** Copy legacy todo.task_id / habit_id / repeat_id into related_type + related_id. */
async function migrateGrowthRepeatRefactor(): Promise<void> {
  const columns: Array<{ name: string }> = await AppDataSource.query(`PRAGMA table_info('todo')`);
  const columnNames = new Set(columns.map((c) => c.name));
  if (!columnNames.has('related_type') || !columnNames.has('related_id')) return;

  if (columnNames.has('task_id')) {
    await AppDataSource.query(
      `UPDATE todo SET related_type = '${TodoRelatedType.TASK}', related_id = task_id WHERE task_id IS NOT NULL AND task_id != '' AND (related_id IS NULL OR related_id = '')`
    );
  }
  if (columnNames.has('habit_id')) {
    await AppDataSource.query(
      `UPDATE todo SET related_type = '${TodoRelatedType.HABIT}', related_id = habit_id WHERE habit_id IS NOT NULL AND habit_id != '' AND (related_id IS NULL OR related_id = '')`
    );
  }
  if (columnNames.has('repeat_id')) {
    await AppDataSource.query(
      `UPDATE todo SET related_type = '${TodoRelatedType.REPEAT}', related_id = repeat_id WHERE repeat_id IS NOT NULL AND repeat_id != '' AND (related_id IS NULL OR related_id = '')`
    );
  }

  await AppDataSource.query(
    `UPDATE todo SET related_type = '${TodoRelatedType.NONE}', related_id = NULL WHERE related_type IN ('${TodoRelatedType.TASK}','${TodoRelatedType.HABIT}','${TodoRelatedType.REPEAT}','${TodoRelatedType.GOAL}') AND (related_id IS NULL OR related_id = '')`
  );
}

/**
 * Split legacy todo_repeat into shared repeat + content-only repeat_todo (keep original ids).
 */
async function migrateTodoRepeatToRepeatTodo(): Promise<void> {
  const tables: Array<{ name: string }> = await AppDataSource.query(
    `SELECT name FROM sqlite_master WHERE type='table' AND name IN ('todo_repeat','repeat_todo','repeat')`
  );
  const tableNames = new Set(tables.map((t) => t.name));
  if (!tableNames.has('todo_repeat') || !tableNames.has('repeat_todo') || !tableNames.has('repeat')) {
    return;
  }

  const legacyRows: Array<Record<string, unknown>> = await AppDataSource.query(
    `SELECT * FROM todo_repeat WHERE deleted_at IS NULL`
  );
  if (!legacyRows.length) {
    await AppDataSource.query(`DROP TABLE IF EXISTS todo_repeat`);
    return;
  }

  const existing: Array<{ id: string }> = await AppDataSource.query(`SELECT id FROM repeat_todo`);
  const existingIds = new Set(existing.map((r) => r.id));

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

    await AppDataSource.query(
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
      ]
    );

    await AppDataSource.query(
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
      ]
    );

    // 历史物化行若 related_id 空且曾指向该模板，尽量回填
    await AppDataSource.query(
      `UPDATE todo SET related_type = '${TodoRelatedType.REPEAT}', related_id = ? WHERE related_type = '${TodoRelatedType.REPEAT}' AND (related_id IS NULL OR related_id = '') AND name = ?`,
      [id, row.name]
    );
  }

  await AppDataSource.query(`DROP TABLE IF EXISTS todo_repeat`);
}

export const closeDatabase = async (): Promise<void> => {
  try {
    if (AppDataSource.isInitialized) {
      const closePromise = AppDataSource.destroy();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('数据库关闭超时')), 5000);
      });

      await Promise.race([closePromise, timeoutPromise]);
      console.log('数据库连接已关闭');
    }
  } catch (error) {
    console.error('关闭数据库连接失败:', error);
    if (AppDataSource.isInitialized) {
      try {
        (AppDataSource as any).isInitialized = false;
      } catch (e) {
        // ignore
      }
    }
  }
};
