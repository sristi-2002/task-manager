import {runMigrations} from './migrations';

export const initializeTaskDatabase = async (): Promise<void> => {
  await runMigrations();
};
