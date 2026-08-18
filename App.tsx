import React, {useEffect} from 'react';
import {Provider} from 'react-redux';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import {store} from './src/app/store';
import RootNavigator from './src/navigation/RootNavigator';
import {ErrorBoundary} from './src/components';
import {ThemeProvider} from './src/theme/ThemeProvider';
import {initializeTaskDatabase} from './src/services/database/taskDatabase';
import {
  createReminderChannel,
  requestNotificationPermission,
} from './src/services/notifications/notificationService';
import {logger} from './src/utils/logger';

const App = () => {
  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeTaskDatabase();
        // The channel must exist before any reminder is scheduled against it.
        await createReminderChannel();
        await requestNotificationPermission();
        logger.info('App initialization complete');
      } catch (error) {
        logger.error('App initialization failed', error);
      }
    };

    initialize();
  }, []);

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <SafeAreaProvider>
          <ThemeProvider>
            <RootNavigator />
          </ThemeProvider>
        </SafeAreaProvider>
      </Provider>
    </ErrorBoundary>
  );
};

export default App;
