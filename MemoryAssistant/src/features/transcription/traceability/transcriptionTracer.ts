import { logger } from '@core/traceability';

const TAG = 'Transcription';

export const transcriptionTracer = {
  // Model loading - INFO level (important milestones)
  modelLoading: (modelSize: string) =>
    logger.info(TAG, 'Loading Whisper model', { modelSize }),

  modelPathResolved: (path: string | null) =>
    logger.debug(TAG, 'Model path resolved', { path }),

  modelPathCheck: (path: string, exists: boolean) =>
    logger.trace(TAG, 'Checking model file', { path, exists }),

  modelLoadSuccess: (modelSize: string) =>
    logger.info(TAG, 'Whisper model loaded successfully', { modelSize }),

  modelLoadError: (error: any) =>
    logger.error(TAG, 'Failed to load Whisper model', {
      message: error?.message,
      stack: error?.stack,
    }),

  modelNotAvailable: () => logger.warn(TAG, 'Whisper model not available'),

  // Audio file - TRACE level (detailed debug)
  audioInputPath: (path: string) =>
    logger.trace(TAG, 'Input audio path', { path }),

  audioNormalizedPath: (path: string) =>
    logger.debug(TAG, 'Normalized audio path', { path }),

  audioFileCheck: (path: string) =>
    logger.trace(TAG, 'Checking audio file', { path }),

  audioFileExists: (exists: boolean, size: number) =>
    logger.info(TAG, 'Audio file check result', { exists, size }),

  audioFileMissing: (path: string) =>
    logger.error(TAG, 'Audio file does not exist', { path }),

  audioFormatCheck: (isWav: boolean, header: string) =>
    logger.info(TAG, 'Audio format check', { isWav, header }),

  // Transcription - INFO level (key milestones)
  transcriptionStart: (path: string) =>
    logger.info(TAG, 'Starting transcription', { path }),

  whisperContextStatus: (loaded: boolean) =>
    logger.debug(TAG, 'Whisper context status', { loaded }),

  whisperCalling: (path: string) =>
    logger.debug(TAG, 'Calling Whisper with path', { path }),

  whisperResult: (result: any) =>
    logger.debug(TAG, 'Whisper raw result', result),

  transcriptionEmpty: () => logger.warn(TAG, 'Whisper returned empty result'),

  transcriptionSuccess: (textLength: number) =>
    logger.info(TAG, 'Transcription complete', { textLength }),

  // Fallback - INFO level (important fallback info)
  usingFallback: (reason: string) =>
    logger.info(TAG, 'Using fallback transcription', { reason }),

  // Error - ERROR level (always shown)
  transcriptionError: (error: any) =>
    logger.error(TAG, 'Transcription failed', {
      message: error?.message,
      stack: error?.stack,
    }),

  unexpectedError: (error: any) =>
    logger.error(TAG, 'Unexpected error during transcription', {
      message: error?.message,
      stack: error?.stack,
    }),
};

export const modelDownloadTracer = {
  // Model download - INFO level
  checkingModel: (size: string) =>
    logger.debug(TAG, 'Checking if model exists', { size }),

  modelNotDownloaded: (size: string) =>
    logger.info(TAG, 'Model not downloaded, starting download', { size }),

  modelDownloading: (size: string, url: string) =>
    logger.info(TAG, 'Downloading model', { size, url }),

  modelDownloadProgress: (size: string, progress: number) =>
    logger.debug(TAG, 'Download progress', { size, progress }),

  modelDownloadSuccess: (size: string, path: string) =>
    logger.info(TAG, 'Model downloaded successfully', { size, path }),

  modelDownloadError: (size: string, error: any) =>
    logger.error(TAG, 'Failed to download model', {
      size,
      error: error?.message,
    }),

  modelAlreadyDownloaded: (size: string) =>
    logger.debug(TAG, 'Model already downloaded', { size }),

  // Path resolution - TRACE level
  resolvingModelPath: (size: string) =>
    logger.trace(TAG, 'Resolving model path', { size }),

  modelPathResult: (path: string | null) =>
    logger.debug(TAG, 'Model path result', { path }),
};
