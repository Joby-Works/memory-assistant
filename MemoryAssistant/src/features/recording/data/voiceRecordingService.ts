import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import {Platform, PermissionsAndroid} from 'react-native';
import {APP_CONSTANTS} from '../../../core/constants';

class VoiceRecordingService {
  // @ts-ignore - library types are incomplete
  private audioRecorderPlayer;
  private isRecording = false;
  private currentFilePath: string | null = null;

  constructor() {
    // @ts-ignore - library types are incomplete
    this.audioRecorderPlayer = new AudioRecorderPlayer();
  }

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);
        return grants[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] === PermissionsAndroid.RESULTS.GRANTED;
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
    let path: string;

    if (Platform.OS === 'ios') {
      path = `recording_${timestamp}.m4a`;
    } else {
      path = `/data/user/0/com.memoryassistant/files/recording_${timestamp}.mp4`;
    }

    this.currentFilePath = path;

    // @ts-ignore - library types are incomplete
    await this.audioRecorderPlayer.startRecorder(path);

    this.isRecording = true;
    return this.currentFilePath;
  }

  async stopRecording(): Promise<string> {
    if (!this.isRecording) {
      throw new Error('Not currently recording');
    }

    const result = await this.audioRecorderPlayer.stopRecorder();
    // @ts-ignore - library types are incomplete
    this.audioRecorderPlayer.removeRecordBackListener();
    this.isRecording = false;
    return result;
  }

  async pauseRecording(): Promise<void> {
    if (this.isRecording) {
      await this.audioRecorderPlayer.pauseRecorder();
    }
  }

  async resumeRecording(): Promise<void> {
    await this.audioRecorderPlayer.resumeRecorder();
  }

  onRecordProgress(callback: (seconds: number) => void): void {
    // @ts-ignore - library types are incomplete
    this.audioRecorderPlayer.addRecordBackListener((e: {currentPosition: number}) => {
      const seconds = Math.floor(e.currentPosition / 1000);
      callback(seconds);
      
      if (seconds >= APP_CONSTANTS.MAX_RECORDING_DURATION_SECONDS) {
        this.stopRecording();
      }
    });
  }

  async startPlayback(filePath: string): Promise<void> {
    await this.audioRecorderPlayer.startPlayer(filePath);
  }

  async stopPlayback(): Promise<void> {
    await this.audioRecorderPlayer.stopPlayer();
    // @ts-ignore - library types are incomplete
    this.audioRecorderPlayer.removePlayBackListener();
  }

  async pausePlayback(): Promise<void> {
    await this.audioRecorderPlayer.pausePlayer();
  }

  async resumePlayback(): Promise<void> {
    await this.audioRecorderPlayer.resumePlayer();
  }

  onPlaybackProgress(callback: (seconds: number) => void): void {
    // @ts-ignore - library types are incomplete
    this.audioRecorderPlayer.addPlayBackListener((e: {currentPosition: number}) => {
      callback(Math.floor(e.currentPosition / 1000));
    });
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}

export const voiceRecordingService = new VoiceRecordingService();
