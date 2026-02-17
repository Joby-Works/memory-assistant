import type {Recording} from '../../../core/types';
import type {RecordingRepository} from '../domain/recordingRepository';
import {storageService} from '../data/storageService';

export class RecordingRepositoryImpl implements RecordingRepository {
  async save(recording: Recording): Promise<void> {
    await storageService.saveRecording(recording);
  }

  async getAll(): Promise<Recording[]> {
    return storageService.getRecordings();
  }

  async getById(id: string): Promise<Recording | null> {
    return storageService.getRecordingById(id);
  }

  async update(recording: Recording): Promise<void> {
    await storageService.updateRecording(recording);
  }

  async delete(id: string): Promise<void> {
    const recording = await storageService.getRecordingById(id);
    if (recording) {
      recording.status = 'calendared';
      await storageService.updateRecording(recording);
    }
  }
}

export const recordingRepository = new RecordingRepositoryImpl();
