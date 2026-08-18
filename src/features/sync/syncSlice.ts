import {createSlice, type PayloadAction} from '@reduxjs/toolkit';

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';

type SyncState = {
  status: SyncStatus;
  online: boolean;
  lastSyncedAt: string | null;
  error: string | null;
};

const initialState: SyncState = {
  status: 'idle',
  online: true,
  lastSyncedAt: null,
  error: null,
};

const syncSlice = createSlice({
  name: 'sync',
  initialState,
  reducers: {
    connectivityChanged: (state, action: PayloadAction<boolean>) => {
      state.online = action.payload;
      if (!action.payload) {
        state.status = 'offline';
      } else if (state.status === 'offline') {
        state.status = 'idle';
      }
    },
    syncStarted: state => {
      state.status = 'syncing';
      state.error = null;
    },
    syncSucceeded: (state, action: PayloadAction<string>) => {
      state.status = state.online ? 'idle' : 'offline';
      state.lastSyncedAt = action.payload;
      state.error = null;
    },
    syncFailed: (state, action: PayloadAction<string>) => {
      state.status = state.online ? 'error' : 'offline';
      state.error = action.payload;
    },
  },
});

export const {connectivityChanged, syncStarted, syncSucceeded, syncFailed} =
  syncSlice.actions;

export default syncSlice.reducer;
