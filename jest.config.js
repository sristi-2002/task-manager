module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['<rootDir>/jest.setup.js'],
  // These ship ESM that Jest must transform rather than skip.
  transformIgnorePatterns: [
    'node_modules/(?!(?:.pnpm/)?((jest-)?react-native|@react-native(-community)?|@react-navigation|react-redux|@reduxjs/toolkit|redux|reselect|react-native-.*|@notifee/react-native|@react-native-firebase/.*)/)',
  ],
};
