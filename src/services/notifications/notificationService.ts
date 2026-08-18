import notifee, {
  AndroidImportance,
  AuthorizationStatus,
  TriggerType,
  type TimestampTrigger,
} from '@notifee/react-native';

import {logger} from '../../utils/logger';
import type {Task} from '../../types/task';

const CHANNEL_ID = 'task-reminders';

export const createReminderChannel = async (): Promise<string> =>
  notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Task reminders',
    importance: AndroidImportance.HIGH,
  });

export const requestNotificationPermission = async (): Promise<boolean> => {
  const settings = await notifee.requestPermission();

  const granted =
    settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
    settings.authorizationStatus === AuthorizationStatus.PROVISIONAL;

  if (!granted) {
    logger.warn('Notification permission denied; reminders will not fire');
  }

  return granted;
};

const notificationBody = (task: Task) => ({
  id: task.id,
  title: task.title,
  body: task.description || 'Task reminder',
  android: {channelId: CHANNEL_ID, pressAction: {id: 'default'}},
});

/** Notification id is the task id, so scheduling twice replaces rather than duplicates. */
export const scheduleTaskReminder = async (task: Task): Promise<void> => {
  await cancelTaskReminder(task.id);

  if (!task.reminderAt || task.completed) {
    return;
  }

  const timestamp = Date.parse(task.reminderAt);
  if (!Number.isFinite(timestamp) || timestamp <= Date.now()) {
    logger.debug(`Skipping past reminder for task ${task.id}`);
    return;
  }

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp,
    alarmManager: {allowWhileIdle: true},
  };

  try {
    await notifee.createTriggerNotification(notificationBody(task), trigger);
  } catch (error) {
    // Thrown when SCHEDULE_EXACT_ALARM is unavailable; an inexact reminder beats none.
    logger.warn('Exact alarm unavailable, falling back to inexact', error);
    await notifee.createTriggerNotification(notificationBody(task), {
      type: TriggerType.TIMESTAMP,
      timestamp,
    });
  }
};

export const cancelTaskReminder = async (taskId: string): Promise<void> => {
  await notifee.cancelTriggerNotification(taskId);
};

export const rescheduleAllReminders = async (tasks: Task[]): Promise<void> => {
  const upcoming = tasks.filter(
    task =>
      task.reminderAt &&
      !task.completed &&
      Date.parse(task.reminderAt) > Date.now(),
  );

  await Promise.all(upcoming.map(scheduleTaskReminder));

  logger.info(`Rescheduled ${upcoming.length} reminder(s)`);
};
