import type { Recording } from '@core/types';
import type { RecordingRepository } from '@features/recording/domain/recordingRepository';
import type { StorageService } from '@features/recording/data/storageService';

export class RecordingRepositoryImpl implements RecordingRepository {
  constructor(private storageService: StorageService) {}

  async save(recording: Recording): Promise<void> {
    await this.storageService.saveRecording(recording);
  }

  async getAll(): Promise<Recording[]> {
    return this.storageService.getRecordings();
  }

  async getById(id: string): Promise<Recording | null> {
    return this.storageService.getRecordingById(id);
  }

  async update(recording: Recording): Promise<void> {
    await this.storageService.updateRecording(recording);
  }

  async delete(id: string): Promise<void> {
    const recording = await this.storageService.getRecordingById(id);
    if (recording) {
      recording.status = 'calendared';
      await this.storageService.updateRecording(recording);
    }
  }
}
