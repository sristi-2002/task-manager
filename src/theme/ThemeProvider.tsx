import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {useColorScheme} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {palettes, type Palette} from './palettes';
import {tokens, type Tokens} from './tokens';
import {logger} from '../utils/logger';

export type ThemePreference = 'system' | 'light' | 'dark';

export type ThemeValue = {
  palette: Palette;
  tokens: Tokens;
  scheme: 'light' | 'dark';
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
};

const STORAGE_KEY = 'theme:preference';

export const ThemeContext = createContext<ThemeValue | null>(null);

export const ThemeProvider = ({children}: {children: React.ReactNode}) => {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(stored => {
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          setPreferenceState(stored);
        }
      })
      .catch(error => logger.warn('Could not read theme preference', error));
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(error =>
      logger.warn('Could not persist theme preference', error),
    );
  }, []);

  const value = useMemo<ThemeValue>(() => {
    const scheme: 'light' | 'dark' =
      preference === 'system'
        ? systemScheme === 'dark'
          ? 'dark'
          : 'light'
        : preference;

    return {palette: palettes[scheme], tokens, scheme, preference, setPreference};
  }, [preference, systemScheme, setPreference]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
