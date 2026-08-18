import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import type {AuthStackParamList} from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

/**
 * Screens are lazy-loaded via getComponent: the require() runs the first time
 * a screen is navigated to, not at navigator construction. React.lazy is
 * deliberately avoided — it routes through Metro's async bundle splitting,
 * which is unreliable in bare React Native.
 */
const AuthNavigator = () => (
  // Both screens render their own headings.
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen
      name="Login"
      getComponent={() => require('../screens/auth/LoginScreen').default}
    />
    <Stack.Screen
      name="Signup"
      getComponent={() => require('../screens/auth/SignupScreen').default}
    />
  </Stack.Navigator>
);

export default AuthNavigator;
