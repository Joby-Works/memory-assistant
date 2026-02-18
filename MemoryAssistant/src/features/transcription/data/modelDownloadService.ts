import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import { networkService } from '@core/services/networkService';
import {
  WhisperModelSize,
  WHISPER_MODELS,
  getModelBySize,
  DEFAULT_MODEL,
  formatBytes,
} from './whisperModels';
import {
  transcriptionTracer,
  modelDownloadTracer,
} from '../traceability/transcriptionTracer';

const DOWNLOADED_MODELS_KEY = 'downloaded_whisper_models';
const MODEL_DOWNLOAD_PROGRESS_KEY = 'model_download_progress';
const MODEL_BASE_URL =
  'https://huggingface.co/ggerganov/whisper.cpp/resolve/main';

export type ModelDownloadStatus =
  | 'not_downloaded'
  | 'downloading'
  | 'downloaded';

export interface ModelStatus {
  size: WhisperModelSize;
  status: ModelDownloadStatus;
  progress?: number;
  error?: string;
}

interface ActiveDownload {
  size: WhisperModelSize;
  jobId: number;
  cancelled: boolean;
}

export class ModelDownloadService {
  private downloadProgressListeners: Set<
    (model: WhisperModelSize, progress: number) => void
  > = new Set();
  private activeDownload: ActiveDownload | null = null;

  async getDownloadedModels(): Promise<WhisperModelSize[]> {
    try {
      const data = await AsyncStorage.getItem(DOWNLOADED_MODELS_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Failed to get downloaded models:', error);
    }
    return [];
  }

  async isModelDownloaded(size: WhisperModelSize): Promise<boolean> {
    const downloaded = await this.getDownloadedModels();
    return downloaded.includes(size);
  }

  async getAllModelStatuses(): Promise<ModelStatus[]> {
    const downloaded = await this.getDownloadedModels();
    const downloading = await this.getDownloadingModel();

    return WHISPER_MODELS.map(model => ({
      size: model.size,
      status: downloaded.includes(model.size)
        ? 'downloaded'
        : downloading === model.size
        ? 'downloading'
        : 'not_downloaded',
    }));
  }

  async getDownloadingModel(): Promise<WhisperModelSize | null> {
    try {
      const data = await AsyncStorage.getItem(MODEL_DOWNLOAD_PROGRESS_KEY);
      if (data) {
        const progress = JSON.parse(data);
        if (progress.status === 'downloading') {
          return progress.size;
        }
      }
    } catch (error) {
      console.error('Failed to get downloading model:', error);
    }
    return null;
  }

  async setModelDownloaded(size: WhisperModelSize): Promise<void> {
    const downloaded = await this.getDownloadedModels();
    if (!downloaded.includes(size)) {
      downloaded.push(size);
      await AsyncStorage.setItem(
        DOWNLOADED_MODELS_KEY,
        JSON.stringify(downloaded),
      );
    }
    await this.clearDownloadProgress();
  }

  async clearDownloadProgress(): Promise<void> {
    await AsyncStorage.removeItem(MODEL_DOWNLOAD_PROGRESS_KEY);
  }

  addProgressListener(
    listener: (model: WhisperModelSize, progress: number) => void,
  ): () => void {
    this.downloadProgressListeners.add(listener);
    return () => {
      this.downloadProgressListeners.delete(listener);
    };
  }

  private notifyProgress(size: WhisperModelSize, progress: number): void {
    this.downloadProgressListeners.forEach(listener =>
      listener(size, progress),
    );
  }

  async downloadModel(
    size: WhisperModelSize,
    onProgress?: (progress: number) => void,
  ): Promise<boolean> {
    modelDownloadTracer.checkingModel(size);
    const isAlreadyDownloaded = await this.isModelDownloaded(size);
    if (isAlreadyDownloaded) {
      modelDownloadTracer.modelAlreadyDownloaded(size);
      return true;
    }

    const networkStatus = await networkService.getNetworkStatus();

    if (networkStatus.isCellular) {
      const confirmed = await this.promptForMobileDataDownload(size);
      if (!confirmed) {
        return false;
      }
    }

    try {
      modelDownloadTracer.modelNotDownloaded(size);
      await this.saveDownloadProgress(size, 0);

      const downloadUrl = `${MODEL_BASE_URL}/ggml-${size}.en.bin`;
      const filePath = `${RNFS.DocumentDirectoryPath}/${size}.bin`;
      modelDownloadTracer.modelDownloading(size, downloadUrl);

      const downloadResult = RNFS.downloadFile({
        fromUrl: downloadUrl,
        toFile: filePath,
        progress: res => {
          const progress = res.bytesWritten / res.contentLength;
          const normalizedProgress = Math.round(progress * 100);
          this.notifyProgress(size, normalizedProgress);
          modelDownloadTracer.modelDownloadProgress(size, normalizedProgress);
          if (onProgress) {
            onProgress(normalizedProgress);
          }
        },
      });

      this.activeDownload = {
        size,
        jobId: downloadResult.jobId,
        cancelled: false,
      };

      const result = await downloadResult.promise;

      if (this.activeDownload?.cancelled) {
        await this.clearDownloadProgress();
        await RNFS.unlink(filePath).catch(() => {});
        this.activeDownload = null;
        return false;
      }

      if (result.statusCode === 200) {
        await this.setModelDownloaded(size);
        modelDownloadTracer.modelDownloadSuccess(size, filePath);
        this.activeDownload = null;
        return true;
      } else {
        throw new Error(`Download failed with status ${result.statusCode}`);
      }
    } catch (error) {
      modelDownloadTracer.modelDownloadError(size, error);
      await this.clearDownloadProgress();
      const filePath = `${RNFS.DocumentDirectoryPath}/${size}.bin`;
      await RNFS.unlink(filePath).catch(() => {});
      this.activeDownload = null;
      return false;
    }
  }

  async cancelDownload(): Promise<void> {
    if (this.activeDownload) {
      this.activeDownload.cancelled = true;
      RNFS.stopDownload(this.activeDownload.jobId);
    }
  }

  getActiveDownload(): { size: WhisperModelSize; cancelled: boolean } | null {
    if (!this.activeDownload) {
      return null;
    }
    return {
      size: this.activeDownload.size,
      cancelled: this.activeDownload.cancelled,
    };
  }

  async promptForMobileDataDownload(size: WhisperModelSize): Promise<boolean> {
    const model = getModelBySize(size);
    const sizeStr = formatBytes(model.bytes);
    return new Promise(resolve => {
      import('react-native').then(({ Alert }) => {
        Alert.alert(
          'Download over Mobile Data?',
          `This will download ~${sizeStr} of data. Continue?`,
          [
            { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
            {
              text: 'Download',
              onPress: () => resolve(true),
            },
          ],
        );
      });
    });
  }

  async saveDownloadProgress(
    size: WhisperModelSize,
    progress: number,
  ): Promise<void> {
    await AsyncStorage.setItem(
      MODEL_DOWNLOAD_PROGRESS_KEY,
      JSON.stringify({ size, status: 'downloading', progress }),
    );
  }

  async getModelPath(size: WhisperModelSize): Promise<string | null> {
    modelDownloadTracer.resolvingModelPath(size);
    const isDownloaded = await this.isModelDownloaded(size);
    if (!isDownloaded) {
      modelDownloadTracer.modelPathResult(null);
      return null;
    }
    const path = `${RNFS.DocumentDirectoryPath}/${size}.bin`;
    modelDownloadTracer.modelPathResult(path);
    return path;
  }

  async ensureModelAvailable(size: WhisperModelSize): Promise<boolean> {
    const isDownloaded = await this.isModelDownloaded(size);
    if (isDownloaded) {
      return true;
    }
    return this.downloadModel(size);
  }

  async deleteModel(size: WhisperModelSize): Promise<void> {
    const downloaded = await this.getDownloadedModels();
    const index = downloaded.indexOf(size);
    if (index > -1) {
      downloaded.splice(index, 1);
      await AsyncStorage.setItem(
        DOWNLOADED_MODELS_KEY,
        JSON.stringify(downloaded),
      );
    }
    const filePath = `${RNFS.DocumentDirectoryPath}/${size}.bin`;
    await RNFS.unlink(filePath).catch(() => {});
  }

  getDefaultModel(): WhisperModelSize {
    return DEFAULT_MODEL;
  }
}

export const modelDownloadService = new ModelDownloadService();
