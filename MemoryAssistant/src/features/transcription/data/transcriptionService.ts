import {extractDates, generateEventTitle} from '../../../core/utils/dateUtils';
import type {DateExtraction} from '../../../core/types';

interface TranscriptionResult {
  text: string;
  dateExtraction: DateExtraction;
  eventTitle: string;
  confidence: number;
}

class TranscriptionService {
  async transcribe(audioFilePath: string): Promise<TranscriptionResult> {
    const text = await this.runWhisper(audioFilePath);
    const dateExtraction = extractDates(text);
    const eventTitle = generateEventTitle(text, dateExtraction.date);
    
    return {
      text,
      dateExtraction,
      eventTitle,
      confidence: dateExtraction.confidence,
    };
  }

  private async runWhisper(audioFilePath: string): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('Sample transcribed text for testing');
      }, 2000);
    });
  }

  isTranscriptionReady(): boolean {
    return false;
  }

  async downloadModel(): Promise<void> {
    // Placeholder for Whisper model download
  }

  getModelStatus(): 'not_downloaded' | 'downloading' | 'ready' {
    return 'not_downloaded';
  }
}

export const transcriptionService = new TranscriptionService();
