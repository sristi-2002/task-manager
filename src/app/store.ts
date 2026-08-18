import {configureStore} from '@reduxjs/toolkit';

import authReducer from '../features/auth/authSlice';
import tasksReducer from '../features/tasks/taskSlice';
import syncReducer from '../features/sync/syncSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: tasksReducer,
    sync: syncReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
