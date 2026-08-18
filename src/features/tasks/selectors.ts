import {createSelector} from '@reduxjs/toolkit';

import type {RootState} from '../../app/store';
import type {Task} from '../../types/task';

export const selectAllTasks = (state: RootState): Task[] => state.tasks.tasks;

export const selectTasksLoading = (state: RootState): boolean =>
  state.tasks.loading;

export const selectPendingCount = createSelector(
  selectAllTasks,
  tasks => tasks.filter(task => task.syncStatus !== 'synced').length,
);

export const selectTaskStats = createSelector(selectAllTasks, tasks => ({
  total: tasks.length,
  completed: tasks.filter(task => task.completed).length,
  remaining: tasks.filter(task => !task.completed).length,
}));

export const selectTaskById = (id: string) =>
  createSelector(
    selectAllTasks,
    tasks => tasks.find(task => task.id === id) ?? null,
  );
