import reducer, {addTask, clearTasks, loadTasks, removeTask} from '../taskSlice';
import type {Task} from '../../../types/task';

const task = (overrides: Partial<Task> = {}): Task => ({
  id: 't1',
  userId: 'u1',
  title: 'Buy groceries',
  description: '',
  completed: false,
  reminderAt: null,
  createdAt: '2026-08-18T09:00:00.000Z',
  updatedAt: '2026-08-18T09:00:00.000Z',
  syncStatus: 'pending_create',
  ...overrides,
});

const initial = {tasks: [], loading: false, error: null};

describe('taskSlice', () => {
  it('sets loading while tasks load', () => {
    expect(reducer(initial, {type: loadTasks.pending.type}).loading).toBe(true);
  });

  it('replaces the list when tasks load', () => {
    const next = reducer(initial, {
      type: loadTasks.fulfilled.type,
      payload: [task()],
    });
    expect(next.tasks).toHaveLength(1);
    expect(next.loading).toBe(false);
  });

  it('records a load failure', () => {
    const next = reducer(initial, {
      type: loadTasks.rejected.type,
      error: {message: 'db closed'},
    });
    expect(next.error).toBe('db closed');
    expect(next.loading).toBe(false);
  });

  it('puts a new task at the top', () => {
    const existing = {...initial, tasks: [task({id: 'old'})]};
    const next = reducer(existing, {
      type: addTask.fulfilled.type,
      payload: task({id: 'new'}),
    });
    expect(next.tasks[0].id).toBe('new');
  });

  it('removes a deleted task from the list', () => {
    const existing = {...initial, tasks: [task({id: 'a'}), task({id: 'b'})]};
    const next = reducer(existing, {
      type: removeTask.fulfilled.type,
      payload: 'a',
    });
    expect(next.tasks.map(t => t.id)).toEqual(['b']);
  });

  it('empties the list on clear', () => {
    const existing = {...initial, tasks: [task()]};
    expect(reducer(existing, clearTasks()).tasks).toHaveLength(0);
  });
});
