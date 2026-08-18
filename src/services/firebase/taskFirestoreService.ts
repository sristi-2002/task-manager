import {
  collection,
  doc,
  getDocs,
  getFirestore,
  query,
  where,
  writeBatch,
} from '@react-native-firebase/firestore';

import {logger} from '../../utils/logger';
import type {Task} from '../../types/task';

export type RemoteTask = Omit<Task, 'syncStatus'> & {deleted: boolean};

const BATCH_LIMIT = 500;

const tasksCollection = (userId: string) =>
  collection(getFirestore(), 'users', userId, 'tasks');

const chunk = <T>(items: T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
};

/** setDoc with merge is idempotent, so retrying a partially-failed batch is safe. */
export const pushTasks = async (
  userId: string,
  tasks: Task[],
): Promise<void> => {
  for (const group of chunk(tasks, BATCH_LIMIT)) {
    const batch = writeBatch(getFirestore());

    group.forEach(task => {
      const ref = doc(tasksCollection(userId), task.id);
      batch.set(
        ref,
        {
          id: task.id,
          userId: task.userId,
          title: task.title,
          description: task.description,
          completed: task.completed,
          reminderAt: task.reminderAt,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          deleted: task.syncStatus === 'pending_delete',
        },
        {merge: true},
      );
    });

    await batch.commit();
  }

  logger.debug(`Pushed ${tasks.length} task(s) to Firestore`);
};

export const pullTasks = async (
  userId: string,
  since: string,
): Promise<RemoteTask[]> => {
  const snapshot = await getDocs(
    query(tasksCollection(userId), where('updatedAt', '>', since)),
  );

  const remote = snapshot.docs.map(document => document.data() as RemoteTask);

  logger.debug(`Pulled ${remote.length} task(s) from Firestore`);

  return remote;
};
