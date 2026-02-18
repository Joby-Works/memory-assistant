import { WhisperModelSize } from '@features/transcription/data/whisperModels';

export type RecordingStatus = 'pending' | 'saved' | 'calendared';

export interface Recording {
  id: string;
  timestamp: Date;
  audioFilePath: string;
  transcript: string;
  status: RecordingStatus;
}

export type CalendarEventStatus = 'pending_review' | 'confirmed' | 'discarded';

export interface CalendarEvent {
  id: string;
  recordingId: string;
  title: string;
  date: Date;
  recurring: boolean;
  status: CalendarEventStatus;
  timestamp?: Date;
}

export interface UserSettings {
  id: string;
  reminderTime: string;
  reviewTime: string;
  hasCompletedOnboarding: boolean;
  calendarPermissionGranted: boolean;
  whisperModel: WhisperModelSize;
}

export interface DateExtraction {
  date: Date | null;
  recurring: boolean;
  confidence: number;
  rawText: string;
}
