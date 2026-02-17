export const APP_CONSTANTS = {
  MAX_RECORDING_DURATION_SECONDS: 60,
  DEFAULT_REMINDER_TIME: '22:00',
  DEFAULT_REVIEW_TIME: '09:00',
  AUDIO_SAMPLE_RATE: 44100,
  AUDIO_CHANNELS: 1,
  AUDIO_ENCODER: 'aac',
} as const;

export const STORAGE_KEYS = {
  USER_SETTINGS: '@memory_assistant_settings',
  RECORDINGS: '@memory_assistant_recordings',
  CALENDAR_EVENTS: '@memory_assistant_calendar_events',
  HAS_COMPLETED_ONBOARDING: '@memory_assistant_onboarding_complete',
} as const;

export const NOTIFICATION_CHANNELS = {
  REMINDER: 'daily-reminder',
  REVIEW: 'review-reminder',
} as const;

export const DATE_PATTERNS = [
  /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?\b/i,
  /\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/,
  /\bnext\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
  /\b(tomorrow|today)\b/i,
] as const;

export const RECURRING_PATTERNS = [
  /\b(every\s+year|annually|yearly|once\s+a\s+year)\b/i,
  /\b(birthday|anniversary)\b/i,
] as const;
