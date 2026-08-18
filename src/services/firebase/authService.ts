import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from '@react-native-firebase/auth';

import {mapAuthError} from './authErrors';

/** getAuth() is called per invocation, not at module scope, to avoid racing native init. */
const run = async <T>(operation: () => Promise<T>): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    const code = (error as {code?: string}).code ?? '';
    throw new Error(mapAuthError(code));
  }
};

export const signUp = (email: string, password: string) =>
  run(() => createUserWithEmailAndPassword(getAuth(), email.trim(), password));

export const signIn = (email: string, password: string) =>
  run(() => signInWithEmailAndPassword(getAuth(), email.trim(), password));

export const signOut = () => run(() => firebaseSignOut(getAuth()));
