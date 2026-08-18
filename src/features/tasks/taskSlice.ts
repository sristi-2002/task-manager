import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';

import {Task} from '../../types/task';
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} from '../../services/database/taskRepository';
import {
  cancelTaskReminder,
  rescheduleAllReminders,
  scheduleTaskReminder,
} from '../../services/notifications/notificationService';
import {generateId} from '../../utils/id';
import {nowIso} from '../../utils/datetime';
import {logger} from '../../utils/logger';

type TasksState = {
  tasks: Task[];
  loading: boolean;
  error: string | null;
};

const initialState: TasksState = {
  tasks: [],
  loading: false,
  error: null,
};

/**
 * A task still awaiting creation must stay pending_create: downgrading it to
 * pending_update would make the sync engine push an update for a document
 * that does not exist yet.
 */
const nextSyncStatus = (current: Task['syncStatus']): Task['syncStatus'] =>
  current === 'pending_create' ? 'pending_create' : 'pending_update';

export const loadTasks = createAsyncThunk(
  'tasks/loadTasks',
  async (userId: string) => {
    const tasks = await getTasks(userId);

    // Android drops scheduled alarms on reboot; re-arming on every load is
    // cheap because scheduleTaskReminder cancels before it creates.
    await rescheduleAllReminders(tasks);

    return tasks;
  },
);

export const addTask = createAsyncThunk(
  'tasks/addTask',
  async (input: {
    userId: string;
    title: string;
    description: string;
    reminderAt: string | null;
  }) => {
    const timestamp = nowIso();

    const task: Task = {
      id: generateId(),
      userId: input.userId,
      title: input.title.trim(),
      description: input.description.trim(),
      completed: false,
      reminderAt: input.reminderAt,
      createdAt: timestamp,
      updatedAt: timestamp,
      syncStatus: 'pending_create',
    };

    await createTask(task);
    await scheduleTaskReminder(task);

    return task;
  },
);

export const editTask = createAsyncThunk(
  'tasks/editTask',
  async (input: {
    task: Task;
    title: string;
    description: string;
    reminderAt: string | null;
  }) => {
    const updated: Task = {
      ...input.task,
      title: input.title.trim(),
      description: input.description.trim(),
      reminderAt: input.reminderAt,
      updatedAt: nowIso(),
      syncStatus: nextSyncStatus(input.task.syncStatus),
    };

    await updateTask(updated);
    await scheduleTaskReminder(updated);

    return updated;
  },
);

export const toggleTask = createAsyncThunk(
  'tasks/toggleTask',
  async (taskId: string, {getState}) => {
    const state = getState() as {tasks: TasksState};
    const current = state.tasks.tasks.find(item => item.id === taskId);

    if (!current) {
      throw new Error(`Task ${taskId} not found`);
    }

    const updated: Task = {
      ...current,
      completed: !current.completed,
      updatedAt: nowIso(),
      syncStatus: nextSyncStatus(current.syncStatus),
    };

    await updateTask(updated);
    // Completing a task silences it: scheduleTaskReminder returns early
    // for completed tasks, having already cancelled the pending alarm.
    await scheduleTaskReminder(updated);

    return updated;
  },
);

export const removeTask = createAsyncThunk(
  'tasks/removeTask',
  async (taskId: string) => {
    await deleteTask(taskId, nowIso());
    await cancelTaskReminder(taskId);
    return taskId;
  },
);

const taskSlice = createSlice({
  name: 'tasks',

  initialState,

  reducers: {
    clearTasks: state => {
      state.tasks = [];
    },
  },

  extraReducers: builder => {
    const replaceById = (state: TasksState, task: Task) => {
      const index = state.tasks.findIndex(item => item.id === task.id);
      if (index !== -1) {
        state.tasks[index] = task;
      }
    };

    builder
      .addCase(loadTasks.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(loadTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load tasks';
      })

      .addCase(addTask.fulfilled, (state, action) => {
        state.tasks.unshift(action.payload);
      })

      .addCase(editTask.fulfilled, (state, action) => {
        replaceById(state, action.payload);
      })

      .addCase(toggleTask.fulfilled, (state, action) => {
        replaceById(state, action.payload);
      })

      .addCase(removeTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(task => task.id !== action.payload);
        logger.debug(`Task removed: ${action.payload}`);
      });
  },
});

export const {clearTasks} = taskSlice.actions;

export default taskSlice.reducer;
