import type {CalendarEvent, CalendarEventRepository} from '../domain/calendarRepository';
import {calendarService} from '../data/calendarService';
import {storageService} from '../../recording/data/storageService';

export class CalendarEventRepositoryImpl implements CalendarEventRepository {
  async save(event: CalendarEvent): Promise<void> {
    await storageService.saveCalendarEvent(event);
  }

  async getAll(): Promise<CalendarEvent[]> {
    return storageService.getCalendarEvents();
  }

  async getPendingReview(): Promise<CalendarEvent[]> {
    return storageService.getPendingReviewEvents();
  }

  async update(event: CalendarEvent): Promise<void> {
    await storageService.updateCalendarEvent(event);
  }

  async confirmEvent(event: CalendarEvent): Promise<string> {
    const eventId = await calendarService.createCalendarEvent(event);
    event.status = 'confirmed';
    await storageService.updateCalendarEvent(event);
    return eventId;
  }
}

export const calendarEventRepository = new CalendarEventRepositoryImpl();
