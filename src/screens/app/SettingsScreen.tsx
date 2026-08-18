import React, {useCallback} from 'react';
import {Pressable, ScrollView, Text, View} from 'react-native';

import {Button, Card, Screen} from '../../components';
import {useAppDispatch, useAppSelector} from '../../app/hooks';
import {signOutThunk} from '../../features/auth/authSlice';
import {clearTasks} from '../../features/tasks/taskSlice';
import {stopSync} from '../../features/sync/syncController';
import {useTheme} from '../../theme/useTheme';
import type {ThemePreference} from '../../theme/ThemeProvider';
import {env} from '../../config/env';

const PREFERENCES: {value: ThemePreference; label: string}[] = [
  {value: 'system', label: 'System'},
  {value: 'light', label: 'Light'},
  {value: 'dark', label: 'Dark'},
];

const SettingsScreen = () => {
  const dispatch = useAppDispatch();
  const {palette, tokens, preference, setPreference} = useTheme();
  const email = useAppSelector(state => state.auth.user?.email);

  const onSignOut = useCallback(() => {
    // Clear first so the next user never sees the previous user's tasks flash.
    stopSync();
    dispatch(clearTasks());
    dispatch(signOutThunk());
  }, [dispatch]);

  const sectionTitle = {
    color: palette.textMuted,
    fontSize: tokens.fontSize.xs,
    fontWeight: '600' as const,
    marginBottom: tokens.spacing.sm,
    marginTop: tokens.spacing.lg,
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={{padding: tokens.spacing.lg}}>
        <Text style={sectionTitle}>APPEARANCE</Text>
        <Card>
          {PREFERENCES.map((option, index) => (
            <Pressable
              key={option.value}
              onPress={() => setPreference(option.value)}
              style={{
                alignItems: 'center',
                borderTopColor: palette.border,
                borderTopWidth: index === 0 ? 0 : 1,
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: tokens.spacing.md,
              }}>
              <Text style={{color: palette.text, fontSize: tokens.fontSize.md}}>
                {option.label}
              </Text>
              {preference === option.value ? (
                <Text style={{color: palette.primary, fontSize: 16}}>✓</Text>
              ) : null}
            </Pressable>
          ))}
        </Card>

        <Text style={sectionTitle}>ACCOUNT</Text>
        <Card>
          <Text
            style={{color: palette.textMuted, fontSize: tokens.fontSize.xs}}>
            Signed in as
          </Text>
          <Text
            style={{
              color: palette.text,
              fontSize: tokens.fontSize.md,
              marginTop: 2,
            }}>
            {email ?? 'Unknown'}
          </Text>
        </Card>

        <Text style={sectionTitle}>ABOUT</Text>
        <Card>
          <View
            style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text style={{color: palette.textMuted}}>App</Text>
            <Text style={{color: palette.text}}>{env.APP_NAME}</Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: tokens.spacing.sm,
            }}>
            <Text style={{color: palette.textMuted}}>Environment</Text>
            <Text style={{color: palette.text}}>{env.APP_ENV}</Text>
          </View>
        </Card>

        <View style={{marginTop: tokens.spacing.xl}}>
          <Button title="Sign out" variant="danger" onPress={onSignOut} />
        </View>
      </ScrollView>
    </Screen>
  );
};

export default SettingsScreen;
