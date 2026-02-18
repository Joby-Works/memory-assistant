import notifee, {
  AndroidImportance,
  TimestampTrigger,
  TriggerType,
  RepeatFrequency,
} from '@notifee/react-native';
import { Platform } from 'react-native';
import { NOTIFICATION_CHANNELS } from '@core/constants';

export class NotificationService {
  async requestPermission(): Promise<boolean> {
    const settings = await notifee.requestPermission();
    return settings.authorizationStatus >= 1;
  }

  async setupChannels(): Promise<void> {
    if (Platform.OS === 'android') {
      await notifee.createChannel({
        id: NOTIFICATION_CHANNELS.REMINDER,
        name: 'Daily Reminders',
        importance: AndroidImportance.HIGH,
        sound: 'default',
      });

      await notifee.createChannel({
        id: NOTIFICATION_CHANNELS.REVIEW,
        name: 'Review Reminders',
        importance: AndroidImportance.HIGH,
        sound: 'default',
      });
    }
  }

  async scheduleDailyReminder(time: string): Promise<void> {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const scheduledDate = new Date();
    scheduledDate.setHours(hours, minutes, 0, 0);

    if (scheduledDate <= now) {
      scheduledDate.setDate(scheduledDate.getDate() + 1);
    }

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: scheduledDate.getTime(),
      repeatFrequency: RepeatFrequency.DAILY,
    };

    await notifee.createTriggerNotification(
      {
        id: NOTIFICATION_CHANNELS.REMINDER,
        title: 'Time to reflect',
        body: 'Did anyone share something today that you should remember?',
        ios: {
          sound: 'default',
        },
        android: {
          channelId: NOTIFICATION_CHANNELS.REMINDER,
          pressAction: {
            id: 'default',
          },
        },
      },
      trigger,
    );
  }

  async scheduleReviewReminder(time: string): Promise<void> {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const scheduledDate = new Date();
    scheduledDate.setHours(hours, minutes, 0, 0);

    if (scheduledDate <= now) {
      scheduledDate.setDate(scheduledDate.getDate() + 1);
    }

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: scheduledDate.getTime(),
      repeatFrequency: RepeatFrequency.DAILY,
    };

    await notifee.createTriggerNotification(
      {
        id: NOTIFICATION_CHANNELS.REVIEW,
        title: 'Review pending memories',
        body: 'You have memories to review and confirm',
        ios: {
          sound: 'default',
        },
        android: {
          channelId: NOTIFICATION_CHANNELS.REVIEW,
          pressAction: {
            id: 'default',
          },
        },
      },
      trigger,
    );
  }

  async cancelAllNotifications(): Promise<void> {
    await notifee.cancelAllNotifications();
  }

  async cancelNotification(notificationId: string): Promise<void> {
    await notifee.cancelNotification(notificationId);
  }

  async displayImmediateNotification(
    title: string,
    body: string,
  ): Promise<void> {
    await notifee.displayNotification({
      title,
      body,
      ios: {
        sound: 'default',
      },
      android: {
        channelId: NOTIFICATION_CHANNELS.REMINDER,
      },
    });
  }
}
