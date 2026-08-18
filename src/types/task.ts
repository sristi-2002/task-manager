export type SyncStatus =
  | 'synced'
  | 'pending_create'
  | 'pending_update'
  | 'pending_delete';

export type Task = {
  id: string;
  userId: string;
  title: string;
  description: string;
  completed: boolean;
  reminderAt: string | null;
  createdAt: string;
  updatedAt: string;
  syncStatus: SyncStatus;
};