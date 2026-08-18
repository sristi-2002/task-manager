import {getDatabase} from './database';
import {EPOCH} from '../../utils/datetime';

const watermarkKey = (userId: string): string => `lastPulledAt:${userId}`;

export const getSyncMeta = async (key: string): Promise<string | null> => {
  const db = getDatabase();
  const result = await db.executeAsync(
    'SELECT value FROM sync_meta WHERE key = ?;',
    [key],
  );
  const row = result.rows._array[0];
  return row ? String(row.value) : null;
};

export const setSyncMeta = async (
  key: string,
  value: string,
): Promise<void> => {
  const db = getDatabase();
  await db.executeAsync(
    'INSERT INTO sync_meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value;',
    [key, value],
  );
};

export const getWatermark = async (userId: string): Promise<string> =>
  (await getSyncMeta(watermarkKey(userId))) ?? EPOCH;

export const setWatermark = (userId: string, value: string): Promise<void> =>
  setSyncMeta(watermarkKey(userId), value);
