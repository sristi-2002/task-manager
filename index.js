/**
 * @format
 */

import { AppRegistry } from 'react-native';
import {
  getMessaging,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';

import App from './App';
import { name as appName } from './app.json';

// Must be registered outside the React tree, or background messages silently
// no-op. FCM renders notification-type payloads itself while backgrounded.
setBackgroundMessageHandler(getMessaging(), async () => {});

AppRegistry.registerComponent(appName, () => App);
