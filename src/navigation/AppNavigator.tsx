import React, {lazy} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {lazyScreen} from './lazyScreen';
import type {AppStackParamList} from './types';

const TaskListScreen = lazy(() => import('../screens/app/TaskListScreen'));
const TaskFormScreen = lazy(() => import('../screens/app/TaskFormScreen'));
const SettingsScreen = lazy(() => import('../screens/app/SettingsScreen'));

const Stack = createNativeStackNavigator<AppStackParamList>();

const AppNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Tasks"
      component={lazyScreen(TaskListScreen)}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="TaskForm"
      component={lazyScreen(TaskFormScreen)}
      options={{title: 'Task', presentation: 'modal'}}
    />
    <Stack.Screen
      name="Settings"
      component={lazyScreen(SettingsScreen)}
      options={{title: 'Settings'}}
    />
  </Stack.Navigator>
);

export default AppNavigator;
