import type {
  CalendarEvent,
  CalendarEventRepository,
} from '@features/calendar/domain/calendarRepository';
import type { CalendarService } from '@features/calendar/data/calendarService';
import type { StorageService } from '@features/recording/data/storageService';

export class CalendarEventRepositoryImpl implements CalendarEventRepository {
  constructor(
    private calendarService: CalendarService,
    private storageService: StorageService,
  ) {}

  async save(event: CalendarEvent): Promise<void> {
    await this.storageService.saveCalendarEvent(event);
  }

  async getAll(): Promise<CalendarEvent[]> {
    return this.storageService.getCalendarEvents();
  }

  async getPendingReview(): Promise<CalendarEvent[]> {
    return this.storageService.getPendingReviewEvents();
  }

  async update(event: CalendarEvent): Promise<void> {
    await this.storageService.updateCalendarEvent(event);
  }

  async confirmEvent(event: CalendarEvent): Promise<string> {
    const eventId = await this.calendarService.createCalendarEvent(event);
    event.status = 'confirmed';
    await this.storageService.updateCalendarEvent(event);
    return eventId;
  }
}
