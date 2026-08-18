import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Task } from '../../types/task';
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} from '../../services/database/taskRepository';

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

export const loadTasks = createAsyncThunk(
  'tasks/loadTasks',
  async (userId: string) => {
    console.log('[Redux] Loading tasks');

    const tasks = await getTasks(userId);

    return tasks;
  },
);

export const addTask = createAsyncThunk(
  'tasks/addTask',
  async (task: Task) => {
    console.log('[Redux] Adding task');

    await createTask(task);

    return task;
  },
);

export const editTask = createAsyncThunk(
  'tasks/editTask',
  async (task: Task) => {
    console.log('[Redux] Editing task');

    await updateTask(task);

    return task;
  },
);

export const removeTask = createAsyncThunk(
  'tasks/removeTask',
  async ({
    taskId,
    updatedAt,
  }: {
    taskId: string;
    updatedAt: string;
  }) => {
    console.log('[Redux] Removing task');

    await deleteTask(taskId, updatedAt);

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
    builder

      // LOAD
      .addCase(loadTasks.pending, state => {
        state.loading = true;
        state.error = null;
      })

      .addCase(loadTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;

        console.log(
          '[Redux] Tasks loaded:',
          action.payload.length,
        );
      })

      .addCase(loadTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load tasks';
      })

      // ADD
      .addCase(addTask.fulfilled, (state, action) => {
        state.tasks.unshift(action.payload);

        console.log(
          '[Redux] Task added:',
          action.payload.id,
        );
      })

      // EDIT
      .addCase(editTask.fulfilled, (state, action) => {
        const index = state.tasks.findIndex(
          task => task.id === action.payload.id,
        );

        if (index !== -1) {
          state.tasks[index] = action.payload;
        }

        console.log(
          '[Redux] Task updated:',
          action.payload.id,
        );
      })

      // DELETE
      .addCase(removeTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter(
          task => task.id !== action.payload,
        );

        console.log(
          '[Redux] Task removed:',
          action.payload,
        );
      });
  },
});

export const { clearTasks } = taskSlice.actions;

export default taskSlice.reducer;
