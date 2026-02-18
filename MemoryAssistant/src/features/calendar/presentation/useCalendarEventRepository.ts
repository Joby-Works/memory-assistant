import { CalendarEventRepositoryImpl } from '../data/calendarEventRepository';
import { useCalendarService } from './useCalendarService';
import { useStorageService } from '@features/recording/presentation/useStorageService';
import type { CalendarEventRepository } from '../domain/calendarRepository';

let instance: CalendarEventRepository | null = null;

export const useCalendarEventRepository = (): CalendarEventRepository => {
  const calendarService = useCalendarService();
  const storageService = useStorageService();

  if (!instance) {
    instance = new CalendarEventRepositoryImpl(calendarService, storageService);
  }
  return instance;
};
