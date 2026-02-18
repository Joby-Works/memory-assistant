declare module 'whisper.rn' {
  export interface TranscribeOptions {
    language?: string;
    onProgress?: (progress: number) => void;
    [key: string]: any;
  }

  export interface TranscribeResult {
    text?: string;
    [key: string]: any;
  }

  export interface TranscriptionHandle {
    stop: () => void;
    promise: Promise<TranscribeResult>;
  }

  export interface WhisperContext {
    transcribe: (filePath: string, options?: TranscribeOptions) => TranscriptionHandle;
    [key: string]: any;
  }

  export function initWhisper(options: { filePath: string; [key: string]: any }): Promise<WhisperContext>;
  export default initWhisper;
}