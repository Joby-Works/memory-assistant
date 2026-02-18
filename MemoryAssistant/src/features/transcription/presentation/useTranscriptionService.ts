import { TranscriptionService } from '../data/transcriptionService';

let instance: TranscriptionService | null = null;

export const useTranscriptionService = () => {
  if (!instance) {
    instance = new TranscriptionService();
  }
  return instance;
};
