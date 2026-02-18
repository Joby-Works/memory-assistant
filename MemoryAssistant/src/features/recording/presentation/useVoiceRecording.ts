import { VoiceRecordingService } from '../data/voiceRecordingService';

let instance: VoiceRecordingService | null = null;

export const useVoiceRecording = () => {
  if (!instance) {
    instance = new VoiceRecordingService();
  }
  return instance;
};
