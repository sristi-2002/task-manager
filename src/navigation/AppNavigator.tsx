import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TaskListScreen from '../screens/app/TaskListScreen';
import type {AppStackParamList} from './types';

const Stack = createNativeStackNavigator<AppStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Tasks"
        component={TaskListScreen}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
