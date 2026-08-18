import { open } from 'react-native-nitro-sqlite';

let database: ReturnType<typeof open> | null = null;

export const getDatabase = () => {
  if (database) {
    return database;
  }

  console.log('[SQLite] Opening database...');

  database = open({
    name: 'TaskManager.db',
  });

  console.log('[SQLite] Database opened successfully');

  return database;
};