import React, {useCallback, useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {Button, Input, Screen} from '../../components';
import {useAppDispatch, useAppSelector} from '../../app/hooks';
import {clearAuthError, signInThunk} from '../../features/auth/authSlice';
import {validateEmail, validatePassword} from '../../utils/validation';
import {useTheme} from '../../theme/useTheme';
import type {AuthStackParamList} from '../../navigation/types';

const LoginScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const dispatch = useAppDispatch();
  const {palette, tokens} = useTheme();
  const {status, error} = useAppSelector(state => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    email: string | null;
    password: string | null;
  }>({email: null, password: null});

  const onSubmit = useCallback(() => {
    const next = {
      email: validateEmail(email),
      password: validatePassword(password),
    };
    setFieldErrors(next);
    if (next.email || next.password) {
      return;
    }
    dispatch(signInThunk({email, password}));
  }, [dispatch, email, password]);

  const goToSignup = useCallback(() => {
    dispatch(clearAuthError());
    navigation.navigate('Signup');
  }, [dispatch, navigation]);

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{flex: 1}}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            padding: tokens.spacing.lg,
          }}
          keyboardShouldPersistTaps="handled">
          <Text
            style={{
              color: palette.text,
              fontSize: tokens.fontSize.xl,
              fontWeight: '700',
              marginBottom: tokens.spacing.xs,
            }}>
            Welcome back
          </Text>
          <Text
            style={{
              color: palette.textMuted,
              fontSize: tokens.fontSize.sm,
              marginBottom: tokens.spacing.lg,
            }}>
            Sign in to reach your tasks on any device.
          </Text>

          <Input
            label="Email"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            error={fieldErrors.email}
            placeholder="you@example.com"
          />

          <Input
            label="Password"
            autoCapitalize="none"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            error={fieldErrors.password}
            placeholder="At least 6 characters"
          />

          {error ? (
            <Text
              style={{color: palette.danger, marginBottom: tokens.spacing.md}}>
              {error}
            </Text>
          ) : null}

          <Button
            title="Sign in"
            onPress={onSubmit}
            loading={status === 'loading'}
          />

          <Pressable onPress={goToSignup} style={{marginTop: tokens.spacing.lg}}>
            <Text style={{color: palette.textMuted, textAlign: 'center'}}>
              No account yet?{' '}
              <Text style={{color: palette.primary, fontWeight: '600'}}>
                Create one
              </Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
};

export default LoginScreen;
