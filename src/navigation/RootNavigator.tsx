import React, {useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import {getAuth, onAuthStateChanged} from '@react-native-firebase/auth';

import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import {useAppDispatch, useAppSelector} from '../app/hooks';
import {setUser} from '../features/auth/authSlice';
import {startSync, stopSync} from '../features/sync/syncController';
import {
  registerForPushNotifications,
  subscribeToForegroundMessages,
} from '../services/firebase/messagingService';
import {useTheme} from '../theme/useTheme';

const RootNavigator = () => {
  const dispatch = useAppDispatch();
  const {palette, scheme} = useTheme();
  const user = useAppSelector(state => state.auth.user);

  // Separate from Redux: distinguishes "no user" from "not resolved yet".
  const [resolved, setResolved] = useState(false);

  useEffect(
    () =>
      onAuthStateChanged(getAuth(), firebaseUser => {
        setResolved(true);
        dispatch(
          setUser(
            firebaseUser
              ? {uid: firebaseUser.uid, email: firebaseUser.email}
              : null,
          ),
        );
      }),
    [dispatch],
  );

  // Keyed on uid, not the user object: setUser produces a fresh object each
  // time and would otherwise restart sync on every auth state emission.
  const userId = user?.uid ?? null;

  useEffect(() => {
    if (!userId) {
      stopSync();
      return;
    }

    startSync(dispatch, userId);
    registerForPushNotifications();
    const unsubscribeMessages = subscribeToForegroundMessages();

    return () => {
      stopSync();
      unsubscribeMessages();
    };
  }, [dispatch, userId]);

  const navigationTheme = useMemo(() => {
    const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: palette.background,
        card: palette.surface,
        text: palette.text,
        border: palette.border,
        primary: palette.primary,
      },
    };
  }, [palette, scheme]);

  if (!resolved) {
    return (
      <View
        style={{
          alignItems: 'center',
          backgroundColor: palette.background,
          flex: 1,
          justifyContent: 'center',
        }}>
        <ActivityIndicator size="large" color={palette.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      {user ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default RootNavigator;
