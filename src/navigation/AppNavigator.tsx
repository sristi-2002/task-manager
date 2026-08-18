import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import type {AppStackParamList} from './types';

const Stack = createNativeStackNavigator<AppStackParamList>();

/**
 * Screens are lazy-loaded via getComponent: the require() runs the first time
 * a screen is navigated to, not at navigator construction. React.lazy is
 * deliberately avoided — it routes through Metro's async bundle splitting,
 * which is unreliable in bare React Native.
 */
const AppNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Tasks"
      getComponent={() => require('../screens/app/TaskListScreen').default}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="TaskForm"
      getComponent={() => require('../screens/app/TaskFormScreen').default}
      options={{title: 'Task', presentation: 'modal'}}
    />
    <Stack.Screen
      name="Settings"
      getComponent={() => require('../screens/app/SettingsScreen').default}
      options={{title: 'Settings'}}
    />
  </Stack.Navigator>
);

export default AppNavigator;
