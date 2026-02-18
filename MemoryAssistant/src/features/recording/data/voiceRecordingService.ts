import AudioRecord from 'react-native-audio-record';
import { Platform, PermissionsAndroid } from 'react-native';
import { APP_CONSTANTS } from '@core/constants';
import RNFS from 'react-native-fs';

export class VoiceRecordingService {
  private isRecording = false;
  private currentFilePath: string | null = null;
  private recordingOptions = {
    sampleRate: 16000,
    channels: 1,
    bitsPerSample: 16,
    wavFile: 'recording.wav',
  };

  constructor() {
    AudioRecord.init({
      sampleRate: 16000,
      channels: 1,
      bitsPerSample: 16,
      wavFile: 'recording.wav',
    });
  }

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);
        return (
          grants[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] ===
          PermissionsAndroid.RESULTS.GRANTED
        );
      } catch {
        return false;
      }
    }
    return true;
  }

  async startRecording(): Promise<string> {
    if (this.isRecording) {
      throw new Error('Already recording');
    }

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error('Microphone permission not granted');
    }

    const timestamp = Date.now();
    const filename = `recording_${timestamp}.wav`;
    const path = `${RNFS.DocumentDirectoryPath}/${filename}`;

    this.recordingOptions.wavFile = filename;
    await AudioRecord.init(this.recordingOptions);

    this.currentFilePath = path;
    await AudioRecord.start();

    this.isRecording = true;

    AudioRecord.on('data', (_data: string) => {
      // Audio data chunks received
    });

    console.log('[VoiceRecordingService] Starting recording with path:', path);
    console.log(
      '[VoiceRecordingService] Recording options:',
      this.recordingOptions,
    );

    return this.currentFilePath;
  }

  async stopRecording(): Promise<string> {
    if (!this.isRecording) {
      throw new Error('Not currently recording');
    }

    const result = await AudioRecord.stop();
    this.isRecording = false;

    // Fix: ensure correct path (library may return incorrect path)
    const filename = this.currentFilePath?.split('/').pop() || '';
    const correctPath = `${RNFS.DocumentDirectoryPath}/${filename}`;

    console.log(
      '[VoiceRecordingService] Stopped recording, file:',
      correctPath,
    );

    return correctPath;
  }

  async pauseRecording(): Promise<void> {
    console.warn('[VoiceRecordingService] Pause not supported in this library');
  }

  async resumeRecording(): Promise<void> {
    console.warn(
      '[VoiceRecordingService] Resume not supported in this library',
    );
  }

  onRecordProgress(callback: (seconds: number) => void): void {
    let startTime = Date.now();

    const interval = setInterval(() => {
      if (this.isRecording) {
        const seconds = Math.floor((Date.now() - startTime) / 1000);
        callback(seconds);

        if (seconds >= APP_CONSTANTS.MAX_RECORDING_DURATION_SECONDS) {
          this.stopRecording();
          clearInterval(interval);
        }
      } else {
        clearInterval(interval);
      }
    }, 1000);
  }

  async startPlayback(filePath: string): Promise<void> {
    // Playback not implemented in this service
    console.warn('[VoiceRecordingService] Playback not implemented');
  }

  async stopPlayback(): Promise<void> {
    // Playback not implemented in this service
  }

  async pausePlayback(): Promise<void> {
    // Playback not implemented in this service
  }

  async resumePlayback(): Promise<void> {
    // Playback not implemented in this service
  }

  onPlaybackProgress(callback: (seconds: number) => void): void {
    // Playback not implemented in this service
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  }
}
