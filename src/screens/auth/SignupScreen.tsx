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
import {clearAuthError, signUpThunk} from '../../features/auth/authSlice';
import {validateEmail, validatePassword} from '../../utils/validation';
import {useTheme} from '../../theme/useTheme';
import type {AuthStackParamList} from '../../navigation/types';

const SignupScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const dispatch = useAppDispatch();
  const {palette, tokens} = useTheme();
  const {status, error} = useAppSelector(state => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    email: string | null;
    password: string | null;
    confirm: string | null;
  }>({email: null, password: null, confirm: null});

  const onSubmit = useCallback(() => {
    const next = {
      email: validateEmail(email),
      password: validatePassword(password),
      confirm: password !== confirm ? 'Passwords do not match.' : null,
    };
    setFieldErrors(next);
    if (next.email || next.password || next.confirm) {
      return;
    }
    dispatch(signUpThunk({email, password}));
  }, [confirm, dispatch, email, password]);

  const goToLogin = useCallback(() => {
    dispatch(clearAuthError());
    navigation.navigate('Login');
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
            Create your account
          </Text>
          <Text
            style={{
              color: palette.textMuted,
              fontSize: tokens.fontSize.sm,
              marginBottom: tokens.spacing.lg,
            }}>
            Tasks sync across your devices, online or off.
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

          <Input
            label="Confirm password"
            autoCapitalize="none"
            secureTextEntry
            value={confirm}
            onChangeText={setConfirm}
            error={fieldErrors.confirm}
            placeholder="Re-enter your password"
          />

          {error ? (
            <Text
              style={{color: palette.danger, marginBottom: tokens.spacing.md}}>
              {error}
            </Text>
          ) : null}

          <Button
            title="Create account"
            onPress={onSubmit}
            loading={status === 'loading'}
          />

          <Pressable onPress={goToLogin} style={{marginTop: tokens.spacing.lg}}>
            <Text style={{color: palette.textMuted, textAlign: 'center'}}>
              Already registered?{' '}
              <Text style={{color: palette.primary, fontWeight: '600'}}>
                Sign in
              </Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
};

export default SignupScreen;
