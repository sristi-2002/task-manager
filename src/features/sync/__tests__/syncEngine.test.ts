import {createSyncEngine, type SyncDeps} from '../syncEngine';
import type {Task} from '../../../types/task';

const task = (overrides: Partial<Task> = {}): Task => ({
  id: 't1',
  userId: 'u1',
  title: 'Task',
  description: '',
  completed: false,
  reminderAt: null,
  createdAt: '2026-08-18T09:00:00.000Z',
  updatedAt: '2026-08-18T09:00:00.000Z',
  syncStatus: 'pending_create',
  ...overrides,
});

const makeDeps = (overrides: Partial<SyncDeps> = {}): SyncDeps => ({
  getPendingTasks: jest.fn().mockResolvedValue([]),
  markTasksSynced: jest.fn().mockResolvedValue(undefined),
  hardDeleteTasks: jest.fn().mockResolvedValue(undefined),
  pushTasks: jest.fn().mockResolvedValue(undefined),
  pullTasks: jest.fn().mockResolvedValue([]),
  getTaskById: jest.fn().mockResolvedValue(null),
  upsertTaskFromRemote: jest.fn().mockResolvedValue(undefined),
  deleteLocalTask: jest.fn().mockResolvedValue(undefined),
  getWatermark: jest.fn().mockResolvedValue('1970-01-01T00:00:00.000Z'),
  setWatermark: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe('syncEngine', () => {
  it('pushes pending tasks and marks them synced', async () => {
    const deps = makeDeps({
      getPendingTasks: jest.fn().mockResolvedValue([task()]),
    });
    const result = await createSyncEngine(deps).runSync('u1');
    expect(deps.pushTasks).toHaveBeenCalledWith('u1', [
      expect.objectContaining({id: 't1'}),
    ]);
    expect(deps.markTasksSynced).toHaveBeenCalledWith(['t1']);
    expect(result.pushed).toBe(1);
  });

  it('hard-deletes locally once a tombstone is pushed', async () => {
    const deps = makeDeps({
      getPendingTasks: jest
        .fn()
        .mockResolvedValue([task({syncStatus: 'pending_delete'})]),
    });
    await createSyncEngine(deps).runSync('u1');
    expect(deps.hardDeleteTasks).toHaveBeenCalledWith(['t1']);
    expect(deps.markTasksSynced).toHaveBeenCalledWith([]);
  });

  it('writes a remote task that has no local counterpart', async () => {
    const deps = makeDeps({
      pullTasks: jest
        .fn()
        .mockResolvedValue([{...task({syncStatus: 'synced'}), deleted: false}]),
    });
    const result = await createSyncEngine(deps).runSync('u1');
    expect(deps.upsertTaskFromRemote).toHaveBeenCalled();
    expect(result.pulled).toBe(1);
  });

  it('keeps a newer local edit over an older remote one', async () => {
    const deps = makeDeps({
      getTaskById: jest
        .fn()
        .mockResolvedValue(task({updatedAt: '2026-08-18T12:00:00.000Z'})),
      pullTasks: jest.fn().mockResolvedValue([
        {...task({updatedAt: '2026-08-18T10:00:00.000Z'}), deleted: false},
      ]),
    });
    await createSyncEngine(deps).runSync('u1');
    expect(deps.upsertTaskFromRemote).not.toHaveBeenCalled();
  });

  it('removes a locally-present task that was deleted remotely', async () => {
    const deps = makeDeps({
      getTaskById: jest.fn().mockResolvedValue(task({syncStatus: 'synced'})),
      pullTasks: jest.fn().mockResolvedValue([
        {...task({updatedAt: '2026-08-18T11:00:00.000Z'}), deleted: true},
      ]),
    });
    await createSyncEngine(deps).runSync('u1');
    expect(deps.deleteLocalTask).toHaveBeenCalledWith('t1');
  });

  it('advances the watermark to the newest pulled timestamp', async () => {
    const deps = makeDeps({
      pullTasks: jest.fn().mockResolvedValue([
        {
          ...task({id: 'a', updatedAt: '2026-08-18T10:00:00.000Z'}),
          deleted: false,
        },
        {
          ...task({id: 'b', updatedAt: '2026-08-18T11:00:00.000Z'}),
          deleted: false,
        },
      ]),
    });
    await createSyncEngine(deps).runSync('u1');
    expect(deps.setWatermark).toHaveBeenCalledWith(
      'u1',
      '2026-08-18T11:00:00.000Z',
    );
  });

  it('leaves the watermark alone when nothing was pulled', async () => {
    const deps = makeDeps();
    await createSyncEngine(deps).runSync('u1');
    expect(deps.setWatermark).not.toHaveBeenCalled();
  });

  it('does not mark tasks synced when the push fails', async () => {
    const deps = makeDeps({
      getPendingTasks: jest.fn().mockResolvedValue([task()]),
      pushTasks: jest.fn().mockRejectedValue(new Error('offline')),
    });
    await expect(createSyncEngine(deps).runSync('u1')).rejects.toThrow(
      'offline',
    );
    expect(deps.markTasksSynced).not.toHaveBeenCalled();
  });

  it('ignores a second run while one is in flight', async () => {
    let release: () => void = () => {};
    const gate = new Promise<void>(resolve => {
      release = resolve;
    });

    const deps = makeDeps({
      getPendingTasks: jest.fn().mockImplementation(async () => {
        await gate;
        return [];
      }),
    });

    const engine = createSyncEngine(deps);
    const first = engine.runSync('u1');
    const second = engine.runSync('u1');
    release();
    await Promise.all([first, second]);

    expect(deps.getPendingTasks).toHaveBeenCalledTimes(1);
  });
});
