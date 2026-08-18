import {selectPendingCount, selectTaskStats} from '../selectors';
import type {Task} from '../../../types/task';

const build = (
  id: string,
  syncStatus: Task['syncStatus'],
  completed = false,
): Task => ({
  id,
  userId: 'u1',
  title: id,
  description: '',
  completed,
  reminderAt: null,
  createdAt: '2026-08-18T09:00:00.000Z',
  updatedAt: '2026-08-18T09:00:00.000Z',
  syncStatus,
});

const state = (tasks: Task[]) =>
  ({tasks: {tasks, loading: false, error: null}}) as never;

describe('task selectors', () => {
  it('counts only unsynced tasks', () => {
    expect(
      selectPendingCount(
        state([
          build('a', 'synced'),
          build('b', 'pending_create'),
          build('c', 'pending_delete'),
        ]),
      ),
    ).toBe(2);
  });

  it('reports zero pending when everything is synced', () => {
    expect(selectPendingCount(state([build('a', 'synced')]))).toBe(0);
  });

  it('summarises completion', () => {
    expect(
      selectTaskStats(
        state([build('a', 'synced', true), build('b', 'synced', false)]),
      ),
    ).toEqual({total: 2, completed: 1, remaining: 1});
  });
});
