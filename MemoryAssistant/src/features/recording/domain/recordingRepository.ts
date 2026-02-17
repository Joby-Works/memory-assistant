import type {Recording} from '../../../core/types';

export interface RecordingRepository {
  save(recording: Recording): Promise<void>;
  getAll(): Promise<Recording[]>;
  getById(id: string): Promise<Recording | null>;
  update(recording: Recording): Promise<void>;
  delete(id: string): Promise<void>;
}
