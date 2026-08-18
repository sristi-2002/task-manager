import {resolveConflict} from './conflict';
import {logger} from '../../utils/logger';
import type {Task} from '../../types/task';
import type {RemoteTask} from '../../services/firebase/taskFirestoreService';

export type SyncResult = {pushed: number; pulled: number};

export type SyncDeps = {
  getPendingTasks: (userId: string) => Promise<Task[]>;
  markTasksSynced: (ids: string[]) => Promise<void>;
  hardDeleteTasks: (ids: string[]) => Promise<void>;
  pushTasks: (userId: string, tasks: Task[]) => Promise<void>;
  pullTasks: (userId: string, since: string) => Promise<RemoteTask[]>;
  getTaskById: (id: string) => Promise<Task | null>;
  upsertTaskFromRemote: (task: Task) => Promise<void>;
  deleteLocalTask: (id: string) => Promise<void>;
  getWatermark: (userId: string) => Promise<string>;
  setWatermark: (userId: string, value: string) => Promise<void>;
};

export const createSyncEngine = (deps: SyncDeps) => {
  let inFlight = false;

  const push = async (userId: string): Promise<number> => {
    const pending = await deps.getPendingTasks(userId);
    if (pending.length === 0) {
      return 0;
    }

    await deps.pushTasks(userId, pending);

    // Only after the remote write succeeds do local statuses change.
    const tombstones = pending
      .filter(t => t.syncStatus === 'pending_delete')
      .map(t => t.id);
    const live = pending
      .filter(t => t.syncStatus !== 'pending_delete')
      .map(t => t.id);

    await deps.hardDeleteTasks(tombstones);
    await deps.markTasksSynced(live);

    return pending.length;
  };

  const pull = async (userId: string): Promise<number> => {
    const since = await deps.getWatermark(userId);
    const remote = await deps.pullTasks(userId, since);
    if (remote.length === 0) {
      return 0;
    }

    let newest = since;

    for (const incoming of remote) {
      const local = await deps.getTaskById(incoming.id);

      // An unsynced local edit still competes on updatedAt — it just may lose.
      if (local && resolveConflict(local, incoming) === 'local') {
        continue;
      }

      if (incoming.deleted) {
        if (local) {
          await deps.deleteLocalTask(incoming.id);
        }
      } else {
        const {deleted, ...fields} = incoming;
        await deps.upsertTaskFromRemote({...fields, syncStatus: 'synced'});
      }

      if (Date.parse(incoming.updatedAt) > Date.parse(newest)) {
        newest = incoming.updatedAt;
      }
    }

    // Advanced only after every write landed, so a mid-pull crash re-fetches.
    await deps.setWatermark(userId, newest);

    return remote.length;
  };

  const runSync = async (userId: string): Promise<SyncResult> => {
    if (inFlight) {
      logger.debug('Sync already running; skipping duplicate trigger');
      return {pushed: 0, pulled: 0};
    }

    inFlight = true;
    try {
      const pushed = await push(userId);
      const pulled = await pull(userId);
      logger.info(`Sync complete: pushed ${pushed}, pulled ${pulled}`);
      return {pushed, pulled};
    } finally {
      inFlight = false;
    }
  };

  return {runSync};
};
