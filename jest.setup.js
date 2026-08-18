/**
 * Native modules have no implementation under Jest. Mock them here so modules
 * that read config at import time (src/config/env.ts) can be imported by tests.
 */

jest.mock('react-native-config', () => ({
  __esModule: true,
  default: {
    APP_ENV: 'development',
    APP_NAME: 'TaskManager Test',
    ENABLE_LOGGING: 'false',
    SYNC_DEBOUNCE_MS: '2000',
  },
}));
