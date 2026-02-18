import { RecordingRepositoryImpl } from '../data/recordingRepository';
import { useStorageService } from './useStorageService';
import type { RecordingRepository } from '../domain/recordingRepository';

let instance: RecordingRepository | null = null;

export const useRecordingRepository = (): RecordingRepository => {
  const storageService = useStorageService();

  if (!instance) {
    instance = new RecordingRepositoryImpl(storageService);
  }
  return instance;
};
