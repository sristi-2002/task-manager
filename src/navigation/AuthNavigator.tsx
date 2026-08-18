import React, {lazy} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {lazyScreen} from './lazyScreen';
import type {AuthStackParamList} from './types';

const LoginScreen = lazy(() => import('../screens/auth/LoginScreen'));
const SignupScreen = lazy(() => import('../screens/auth/SignupScreen'));

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = () => (
  // Both screens render their own headings.
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="Login" component={lazyScreen(LoginScreen)} />
    <Stack.Screen name="Signup" component={lazyScreen(SignupScreen)} />
  </Stack.Navigator>
);

export default AuthNavigator;
