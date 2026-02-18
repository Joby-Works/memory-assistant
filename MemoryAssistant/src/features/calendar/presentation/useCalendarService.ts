import { CalendarService } from '../data/calendarService';

let instance: CalendarService | null = null;

export const useCalendarService = () => {
  if (!instance) {
    instance = new CalendarService();
  }
  return instance;
};
