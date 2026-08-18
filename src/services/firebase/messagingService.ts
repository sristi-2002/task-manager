import notifee, {AndroidImportance} from '@notifee/react-native';
import {getMessaging, getToken, onMessage} from '@react-native-firebase/messaging';

import {logger} from '../../utils/logger';

const CHANNEL_ID = 'task-reminders';

export const registerForPushNotifications = async (): Promise<string | null> => {
  try {
    const token = await getToken(getMessaging());
    logger.info(`FCM token acquired: ${token.slice(0, 12)}…`);
    return token;
  } catch (error) {
    logger.warn('Could not acquire FCM token', error);
    return null;
  }
};

/** FCM does not draw a notification while the app is foregrounded — Notifee must. */
export const subscribeToForegroundMessages = (): (() => void) =>
  onMessage(getMessaging(), async message => {
    await notifee.displayNotification({
      title: message.notification?.title ?? 'Task Manager',
      body: message.notification?.body ?? '',
      android: {
        channelId: CHANNEL_ID,
        importance: AndroidImportance.HIGH,
        pressAction: {id: 'default'},
      },
    });
  });
