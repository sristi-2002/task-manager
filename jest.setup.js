/**
 * Native modules have no implementation under Jest. Mock them here so modules
 * that touch native code at import time can be imported by tests.
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

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
    removeItem: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('@react-native-firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(() => () => {}),
}));

jest.mock('@react-native-firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(),
  doc: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  writeBatch: jest.fn(),
}));

jest.mock('react-native-nitro-sqlite', () => ({
  open: jest.fn(() => ({
    execute: jest.fn(),
    executeAsync: jest.fn().mockResolvedValue({rows: {_array: []}}),
  })),
}));

jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: {
    createChannel: jest.fn().mockResolvedValue('task-reminders'),
    requestPermission: jest.fn().mockResolvedValue({authorizationStatus: 1}),
    createTriggerNotification: jest.fn().mockResolvedValue(undefined),
    cancelTriggerNotification: jest.fn().mockResolvedValue(undefined),
    displayNotification: jest.fn().mockResolvedValue(undefined),
  },
  AndroidImportance: {HIGH: 4},
  AuthorizationStatus: {DENIED: 0, AUTHORIZED: 1, PROVISIONAL: 2},
  TriggerType: {TIMESTAMP: 0},
}));

jest.mock('@react-native-firebase/messaging', () => ({
  getMessaging: jest.fn(() => ({})),
  getToken: jest.fn().mockResolvedValue('test-token'),
  onMessage: jest.fn(() => () => {}),
  setBackgroundMessageHandler: jest.fn(),
}));

jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: {
    addEventListener: jest.fn(() => () => {}),
    fetch: jest.fn().mockResolvedValue({isConnected: true, isInternetReachable: true}),
  },
}));
