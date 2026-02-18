import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Recording, CalendarEvent, UserSettings } from '@core/types';
import { STORAGE_KEYS } from '@core/constants';

export class StorageService {
  async saveSettings(settings: UserSettings): Promise<void> {
    await AsyncStorage.setItem(
      STORAGE_KEYS.USER_SETTINGS,
      JSON.stringify(settings),
    );
  }

  async getSettings(): Promise<UserSettings | null> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
    return data ? JSON.parse(data) : null;
  }

  async saveRecording(recording: Recording): Promise<void> {
    const recordings = await this.getRecordings();
    recordings.push(recording);
    await AsyncStorage.setItem(
      STORAGE_KEYS.RECORDINGS,
      JSON.stringify(recordings),
    );
  }

  async getRecordings(): Promise<Recording[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.RECORDINGS);
    if (!data) return [];
    const recordings = JSON.parse(data);
    return recordings.map((r: Recording) => ({
      ...r,
      timestamp: new Date(r.timestamp),
    }));
  }

  async updateRecording(recording: Recording): Promise<void> {
    const recordings = await this.getRecordings();
    const index = recordings.findIndex(r => r.id === recording.id);
    if (index !== -1) {
      recordings[index] = recording;
      await AsyncStorage.setItem(
        STORAGE_KEYS.RECORDINGS,
        JSON.stringify(recordings),
      );
    }
  }

  async getRecordingById(id: string): Promise<Recording | null> {
    const recordings = await this.getRecordings();
    return recordings.find(r => r.id === id) || null;
  }

  async saveCalendarEvent(event: CalendarEvent): Promise<void> {
    const events = await this.getCalendarEvents();
    events.push(event);
    await AsyncStorage.setItem(
      STORAGE_KEYS.CALENDAR_EVENTS,
      JSON.stringify(events),
    );
  }

  async getCalendarEvents(): Promise<CalendarEvent[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.CALENDAR_EVENTS);
    if (!data) return [];
    const events = JSON.parse(data);
    return events.map((e: CalendarEvent) => ({
      ...e,
      date: new Date(e.date),
      timestamp: e.timestamp ? new Date(e.timestamp) : undefined,
    }));
  }

  async updateCalendarEvent(event: CalendarEvent): Promise<void> {
    const events = await this.getCalendarEvents();
    const index = events.findIndex(e => e.id === event.id);
    if (index !== -1) {
      events[index] = event;
      await AsyncStorage.setItem(
        STORAGE_KEYS.CALENDAR_EVENTS,
        JSON.stringify(events),
      );
    }
  }

  async getPendingReviewEvents(): Promise<CalendarEvent[]> {
    const events = await this.getCalendarEvents();
    return events.filter(e => e.status === 'pending_review');
  }

  async hasCompletedOnboarding(): Promise<boolean> {
    const data = await AsyncStorage.getItem(
      STORAGE_KEYS.HAS_COMPLETED_ONBOARDING,
    );
    return data === 'true';
  }

  async setOnboardingComplete(): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.HAS_COMPLETED_ONBOARDING, 'true');
  }

  async clearAllData(): Promise<void> {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.USER_SETTINGS,
      STORAGE_KEYS.RECORDINGS,
      STORAGE_KEYS.CALENDAR_EVENTS,
      STORAGE_KEYS.HAS_COMPLETED_ONBOARDING,
    ]);
  }
}
