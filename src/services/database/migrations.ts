import {getDatabase} from './database';
import {logger} from '../../utils/logger';

type Migration = {version: number; up: string[]};

const MIGRATIONS: Migration[] = [
  {
    version: 1,
    up: [
      `CREATE TABLE IF NOT EXISTS tasks (
         id TEXT PRIMARY KEY NOT NULL,
         userId TEXT NOT NULL,
         title TEXT NOT NULL,
         description TEXT,
         completed INTEGER NOT NULL DEFAULT 0,
         reminderAt TEXT,
         createdAt TEXT NOT NULL,
         updatedAt TEXT NOT NULL,
         syncStatus TEXT NOT NULL
       );`,
      `CREATE INDEX IF NOT EXISTS idx_tasks_user ON tasks (userId, createdAt DESC);`,
      `CREATE INDEX IF NOT EXISTS idx_tasks_sync ON tasks (syncStatus);`,
    ],
  },
  {
    version: 2,
    up: [
      `CREATE TABLE IF NOT EXISTS sync_meta (
         key TEXT PRIMARY KEY NOT NULL,
         value TEXT NOT NULL
       );`,
    ],
  },
];

export const runMigrations = async (): Promise<void> => {
  const db = getDatabase();
  const result = await db.executeAsync('PRAGMA user_version;');
  const current = Number(result.rows._array[0]?.user_version ?? 0);

  const pending = MIGRATIONS.filter(m => m.version > current);
  if (pending.length === 0) {
    logger.debug(`Schema up to date at version ${current}`);
    return;
  }

  for (const migration of pending) {
    logger.info(`Applying migration ${migration.version}`);
    for (const statement of migration.up) {
      await db.executeAsync(statement);
    }
    // PRAGMA does not accept bound parameters.
    await db.executeAsync(`PRAGMA user_version = ${migration.version};`);
  }

  logger.info(
    `Schema migrated to version ${pending[pending.length - 1].version}`,
  );
};
