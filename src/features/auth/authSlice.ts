import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';

import {signIn, signOut, signUp} from '../../services/firebase/authService';
import type {AuthUser} from '../../types/user';

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'error';

type AuthState = {
  user: AuthUser | null;
  status: AuthStatus;
  error: string | null;
};

const initialState: AuthState = {user: null, status: 'idle', error: null};

type Credentials = {email: string; password: string};

export const signUpThunk = createAsyncThunk(
  'auth/signUp',
  async ({email, password}: Credentials) => {
    await signUp(email, password);
  },
);

export const signInThunk = createAsyncThunk(
  'auth/signIn',
  async ({email, password}: Credentials) => {
    await signIn(email, password);
  },
);

export const signOutThunk = createAsyncThunk('auth/signOut', async () => {
  await signOut();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Driven by onAuthStateChanged, which is the single source of session truth.
    setUser: (state, action: PayloadAction<AuthUser | null>) => {
      state.user = action.payload;
      state.status = action.payload ? 'authenticated' : 'idle';
      state.error = null;
    },
    clearAuthError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    [signUpThunk, signInThunk, signOutThunk].forEach(thunk => {
      builder
        .addCase(thunk.pending, state => {
          state.status = 'loading';
          state.error = null;
        })
        .addCase(thunk.rejected, (state, action) => {
          state.status = 'error';
          state.error =
            action.error.message ?? 'Something went wrong. Please try again.';
        });
    });
    // Fulfilled deliberately has no handler: onAuthStateChanged fires setUser.
  },
});

export const {setUser, clearAuthError} = authSlice.actions;

export default authSlice.reducer;
