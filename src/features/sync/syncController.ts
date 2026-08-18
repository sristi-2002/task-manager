import {AppState} from 'react-native';

import {createSyncEngine} from './syncEngine';
import {
  connectivityChanged,
  syncFailed,
  syncStarted,
  syncSucceeded,
} from './syncSlice';
import {loadTasks} from '../tasks/taskSlice';
import {subscribeToConnectivity} from '../../services/connectivity/connectivityService';
import {
  pullTasks,
  pushTasks,
} from '../../services/firebase/taskFirestoreService';
import {
  getWatermark,
  setWatermark,
} from '../../services/database/syncMetaRepository';
import {
  getPendingTasks,
  getTaskById,
  hardDeleteTasks,
  markTasksSynced,
  upsertTaskFromRemote,
} from '../../services/database/taskRepository';
import {nowIso} from '../../utils/datetime';
import {logger} from '../../utils/logger';
import {env} from '../../config/env';
import type {AppDispatch} from '../../app/store';

const engine = createSyncEngine({
  getPendingTasks,
  markTasksSynced,
  hardDeleteTasks,
  pushTasks,
  pullTasks,
  getTaskById,
  upsertTaskFromRemote,
  deleteLocalTask: id => hardDeleteTasks([id]),
  getWatermark,
  setWatermark,
});

let unsubscribers: Array<() => void> = [];
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export const triggerSync = async (
  dispatch: AppDispatch,
  userId: string,
): Promise<void> => {
  dispatch(syncStarted());

  try {
    const result = await engine.runSync(userId);
    dispatch(syncSucceeded(nowIso()));

    // Only reload from SQLite when the pull actually changed something.
    if (result.pulled > 0) {
      dispatch(loadTasks(userId));
    }
  } catch (error) {
    logger.error('Sync failed', error);
    dispatch(syncFailed((error as Error).message));
  }
};

/** Coalesces a burst of local edits into one sync run. */
export const scheduleSync = (dispatch: AppDispatch, userId: string): void => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = setTimeout(
    () => triggerSync(dispatch, userId),
    env.SYNC_DEBOUNCE_MS,
  );
};

export const startSync = (dispatch: AppDispatch, userId: string): void => {
  stopSync();

  unsubscribers.push(
    subscribeToConnectivity(online => {
      dispatch(connectivityChanged(online));
      if (online) {
        triggerSync(dispatch, userId);
      }
    }),
  );

  const appStateSub = AppState.addEventListener('change', state => {
    if (state === 'active') {
      triggerSync(dispatch, userId);
    }
  });
  unsubscribers.push(() => appStateSub.remove());

  triggerSync(dispatch, userId);
};

export const stopSync = (): void => {
  unsubscribers.forEach(fn => fn());
  unsubscribers = [];

  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
};
