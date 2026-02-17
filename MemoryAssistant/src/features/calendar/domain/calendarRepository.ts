export type {CalendarEvent} from '../../../core/types';
import type {CalendarEvent} from '../../../core/types';

export interface CalendarRepository {
  requestPermission(): Promise<boolean>;
  hasPermission(): Promise<boolean>;
  createEvent(event: CalendarEvent): Promise<string>;
  updateEvent(eventId: string, event: Partial<CalendarEvent>): Promise<void>;
  deleteEvent(eventId: string): Promise<void>;
  getEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]>;
}

export interface CalendarEventRepository {
  save(event: CalendarEvent): Promise<void>;
  getAll(): Promise<CalendarEvent[]>;
  getPendingReview(): Promise<CalendarEvent[]>;
  update(event: CalendarEvent): Promise<void>;
}
