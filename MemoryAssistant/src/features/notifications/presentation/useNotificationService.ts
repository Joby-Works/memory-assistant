import { NotificationService } from '../data/notificationService';

let instance: NotificationService | null = null;

export const useNotificationService = () => {
  if (!instance) {
    instance = new NotificationService();
  }
  return instance;
};
