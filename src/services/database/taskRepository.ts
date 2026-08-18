import {getDatabase} from './database';
import {logger} from '../../utils/logger';
import {Task} from '../../types/task';

const mapRow = (row: Record<string, unknown>): Task => ({
  id: String(row.id),
  userId: String(row.userId),
  title: String(row.title),
  description: row.description == null ? '' : String(row.description),
  completed: row.completed === 1,
  reminderAt: row.reminderAt == null ? null : String(row.reminderAt),
  createdAt: String(row.createdAt),
  updatedAt: String(row.updatedAt),
  syncStatus: String(row.syncStatus) as Task['syncStatus'],
});

export const createTask = async (task: Task): Promise<void> => {
  const db = getDatabase();

  await db.executeAsync(
    `
      INSERT INTO tasks (
        id,
        userId,
        title,
        description,
        completed,
        reminderAt,
        createdAt,
        updatedAt,
        syncStatus
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      task.id,
      task.userId,
      task.title,
      task.description,
      task.completed ? 1 : 0,
      task.reminderAt,
      task.createdAt,
      task.updatedAt,
      task.syncStatus,
    ],
  );

  logger.debug(`Task created: ${task.id}`);
};

export const getTasks = async (userId: string): Promise<Task[]> => {
  const db = getDatabase();

  const result = await db.executeAsync(
    `
      SELECT *
      FROM tasks
      WHERE userId = ?
      AND syncStatus != 'pending_delete'
      ORDER BY createdAt DESC
    `,
    [userId],
  );

  const tasks = result.rows._array.map(mapRow);

  logger.debug(`Tasks loaded: ${tasks.length}`);

  return tasks;
};

export const updateTask = async (task: Task): Promise<void> => {
  const db = getDatabase();

  await db.executeAsync(
    `
      UPDATE tasks
      SET
        title = ?,
        description = ?,
        completed = ?,
        reminderAt = ?,
        updatedAt = ?,
        syncStatus = ?
      WHERE id = ?
    `,
    [
      task.title,
      task.description,
      task.completed ? 1 : 0,
      task.reminderAt,
      task.updatedAt,
      task.syncStatus,
      task.id,
    ],
  );

  logger.debug(`Task updated: ${task.id}`);
};

/** Soft delete: the row survives as a tombstone until the sync engine confirms it. */
export const deleteTask = async (
  taskId: string,
  updatedAt: string,
): Promise<void> => {
  const db = getDatabase();

  await db.executeAsync(
    `
      UPDATE tasks
      SET
        updatedAt = ?,
        syncStatus = 'pending_delete'
      WHERE id = ?
    `,
    [updatedAt, taskId],
  );

  logger.debug(`Task marked for deletion: ${taskId}`);
};

export const getTaskById = async (id: string): Promise<Task | null> => {
  const db = getDatabase();
  const result = await db.executeAsync('SELECT * FROM tasks WHERE id = ?;', [
    id,
  ]);
  const row = result.rows._array[0];
  return row ? mapRow(row) : null;
};

export const getPendingTasks = async (userId: string): Promise<Task[]> => {
  const db = getDatabase();
  const result = await db.executeAsync(
    `SELECT * FROM tasks WHERE userId = ? AND syncStatus != 'synced' ORDER BY updatedAt ASC;`,
    [userId],
  );
  return result.rows._array.map(mapRow);
};

export const markTasksSynced = async (ids: string[]): Promise<void> => {
  if (ids.length === 0) {
    return;
  }
  const db = getDatabase();
  const placeholders = ids.map(() => '?').join(', ');
  await db.executeAsync(
    `UPDATE tasks SET syncStatus = 'synced' WHERE id IN (${placeholders});`,
    ids,
  );
  logger.debug(`Marked ${ids.length} task(s) synced`);
};

export const hardDeleteTasks = async (ids: string[]): Promise<void> => {
  if (ids.length === 0) {
    return;
  }
  const db = getDatabase();
  const placeholders = ids.map(() => '?').join(', ');
  await db.executeAsync(
    `DELETE FROM tasks WHERE id IN (${placeholders});`,
    ids,
  );
  logger.debug(`Hard-deleted ${ids.length} task(s)`);
};

/** Writes a task received from Firestore. Always lands as 'synced'. */
export const upsertTaskFromRemote = async (task: Task): Promise<void> => {
  const db = getDatabase();
  await db.executeAsync(
    `INSERT INTO tasks (id, userId, title, description, completed, reminderAt, createdAt, updatedAt, syncStatus)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'synced')
     ON CONFLICT(id) DO UPDATE SET
       title = excluded.title,
       description = excluded.description,
       completed = excluded.completed,
       reminderAt = excluded.reminderAt,
       updatedAt = excluded.updatedAt,
       syncStatus = 'synced';`,
    [
      task.id,
      task.userId,
      task.title,
      task.description,
      task.completed ? 1 : 0,
      task.reminderAt,
      task.createdAt,
      task.updatedAt,
    ],
  );
};
