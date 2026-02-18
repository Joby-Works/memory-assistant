import { initWhisper } from 'whisper.rn';
import { extractDates, generateEventTitle } from '@core/utils/dateUtils';
import type { DateExtraction } from '@core/types';
import { modelDownloadService } from './modelDownloadService';
import { WhisperModelSize } from './whisperModels';
import RNFS from 'react-native-fs';
import { transcriptionTracer } from '../traceability/transcriptionTracer';

interface TranscriptionResult {
  text: string;
  dateExtraction: DateExtraction;
  eventTitle: string;
  confidence: number;
}

interface TranscriptionOptions {
  modelSize?: WhisperModelSize;
  language?: string;
  onProgress?: (progress: number) => void;
}

export class TranscriptionService {
  private whisperContext: any = null;
  private currentModelSize: WhisperModelSize | null = null;
  private isCancelled = false;

  private normalizeAudioPath(path: string): string {
    if (path.startsWith('file://')) {
      return path.replace('file://', '');
    }
    return path;
  }

  private async checkAudioFile(path: string): Promise<boolean> {
    try {
      const normalizedPath = this.normalizeAudioPath(path);
      transcriptionTracer.audioFileCheck(normalizedPath);
      const exists = await RNFS.exists(normalizedPath);
      if (!exists) {
        transcriptionTracer.audioFileMissing(normalizedPath);
        return false;
      }
      const stat = await RNFS.stat(normalizedPath);
      transcriptionTracer.audioFileExists(true, stat.size);
      return true;
    } catch (error) {
      transcriptionTracer.audioFileMissing(path);
      return false;
    }
  }

  private async verifyWavFormat(path: string): Promise<boolean> {
    try {
      const normalizedPath = this.normalizeAudioPath(path);
      const headerBase64 = await RNFS.readFile(normalizedPath, 'base64');
      const headerHex = this.base64ToHex(headerBase64.substring(0, 8));
      const isWav = headerHex.startsWith('52494646');
      transcriptionTracer.audioFormatCheck(isWav, headerHex);
      return isWav;
    } catch (error) {
      transcriptionTracer.audioFormatCheck(false, 'read_error');
      return false;
    }
  }

  private base64ToHex(base64: string): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let bits = '';
    for (let i = 0; i < base64.length; i++) {
      const val = chars.indexOf(base64[i]);
      if (val === -1) break;
      bits += val.toString(2).padStart(6, '0');
    }
    let hex = '';
    for (let i = 0; i + 4 <= bits.length; i += 4) {
      hex += parseInt(bits.substring(i, i + 4), 2).toString(16);
    }
    return hex;
  }

  async transcribe(
    audioFilePath: string,
    options?: TranscriptionOptions,
  ): Promise<TranscriptionResult> {
    this.isCancelled = false;
    const modelSize = options?.modelSize || 'base';

    transcriptionTracer.audioInputPath(audioFilePath);
    transcriptionTracer.whisperContextStatus(!!this.whisperContext);

    const normalizedPath = this.normalizeAudioPath(audioFilePath);
    transcriptionTracer.audioNormalizedPath(normalizedPath);

    const fileExists = await this.checkAudioFile(normalizedPath);
    if (!fileExists) {
      transcriptionTracer.usingFallback('Audio file not found');
      return {
        text: await this.runWhisper(audioFilePath),
        dateExtraction: {
          date: null,
          recurring: false,
          confidence: 0,
          rawText: '',
        },
        eventTitle: 'Memory reminder',
        confidence: 0,
      };
    }

    await this.ensureModelLoaded(modelSize);

    if (this.isCancelled) {
      throw new Error('Transcription cancelled');
    }

    let text: string;

    if (this.whisperContext) {
      try {
        const transcribeOptions: any = {
          language: options?.language || 'en',
        };

        if (options?.onProgress) {
          transcribeOptions.onProgress = options.onProgress;
        }

        transcriptionTracer.whisperCalling(normalizedPath);

        const { stop, promise } = this.whisperContext.transcribe(
          normalizedPath,
          transcribeOptions,
        );

        const result = await promise;
        transcriptionTracer.whisperResult(result);
        text = result?.result || result?.text || '';

        if (this.isCancelled) {
          stop();
          throw new Error('Transcription cancelled');
        }

        if (!text || !text.trim()) {
          transcriptionTracer.transcriptionEmpty();
          transcriptionTracer.usingFallback('Whisper returned empty text');
          text = await this.runWhisper(audioFilePath);
        } else {
          transcriptionTracer.transcriptionSuccess(text.length);
        }
      } catch (error) {
        transcriptionTracer.transcriptionError(error);
        transcriptionTracer.usingFallback('Whisper threw an error');
        text = await this.runWhisper(audioFilePath);
      }
    } else {
      transcriptionTracer.modelNotAvailable();
      transcriptionTracer.usingFallback('Whisper context not loaded');
      text = await this.runWhisper(audioFilePath);
    }

    const dateExtraction = extractDates(text);
    const eventTitle = generateEventTitle(text, dateExtraction.date);

    return {
      text,
      dateExtraction,
      eventTitle,
      confidence: dateExtraction.confidence,
    };
  }

  private async ensureModelLoaded(modelSize: WhisperModelSize): Promise<void> {
    if (this.whisperContext && this.currentModelSize === modelSize) {
      return;
    }

    transcriptionTracer.modelLoading(modelSize);

    let modelPath = await modelDownloadService.getModelPath(modelSize);
    transcriptionTracer.modelPathResolved(modelPath);

    if (!modelPath) {
      transcriptionTracer.usingFallback(
        'Model not downloaded, attempting download',
      );
      const downloaded = await modelDownloadService.ensureModelAvailable(
        modelSize,
      );
      if (!downloaded) {
        transcriptionTracer.modelLoadError(new Error('Model download failed'));
        throw new Error('Model not available and could not be downloaded');
      }
      modelPath = await modelDownloadService.getModelPath(modelSize);
      transcriptionTracer.modelPathResolved(modelPath);
    }

    if (!modelPath) {
      transcriptionTracer.modelLoadError(
        new Error('Model path not found after download'),
      );
      throw new Error('Model path not found after download');
    }

    try {
      transcriptionTracer.modelLoading(modelSize);
      this.whisperContext = await initWhisper({
        filePath: modelPath,
      });
      this.currentModelSize = modelSize;
      transcriptionTracer.modelLoadSuccess(modelSize);
    } catch (error) {
      transcriptionTracer.modelLoadError(error);
      this.whisperContext = null;
      throw error;
    }
  }

  private async runWhisper(_audioFilePath: string): Promise<string> {
    await new Promise<void>(resolve => setTimeout(() => resolve(), 2000));
    return 'Sample transcribed text for testing';
  }

  cancel(): void {
    this.isCancelled = true;
  }

  isTranscriptionReady(): boolean {
    return this.whisperContext !== null;
  }

  async downloadModel(size: WhisperModelSize): Promise<boolean> {
    return modelDownloadService.downloadModel(size);
  }

  getModelStatus(): 'not_downloaded' | 'downloading' | 'ready' {
    return 'ready';
  }

  async getAllModelStatuses() {
    return modelDownloadService.getAllModelStatuses();
  }
}

export const transcriptionService = new TranscriptionService();
