import React, {useEffect} from 'react';
import {Provider} from 'react-redux';

import {store} from './src/app/store';
import RootNavigator from './src/navigation/RootNavigator';
import {initializeTaskDatabase} from './src/services/database/taskDatabase';
import {logger} from './src/utils/logger';

const App = () => {
  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeTaskDatabase();
        logger.info('Database initialization complete');
      } catch (error) {
        logger.error('Database initialization failed', error);
      }
    };

    initialize();
  }, []);

  return (
    <Provider store={store}>
      <RootNavigator />
    </Provider>
  );
};

export default App;
