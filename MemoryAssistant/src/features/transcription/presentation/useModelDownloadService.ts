import { useState, useEffect, useCallback, useRef } from 'react';
import { ModelDownloadService } from '../data/modelDownloadService';
import type { WhisperModelSize } from '../data/whisperModels';

let serviceInstance: ModelDownloadService | null = null;

export interface ActiveDownload {
  size: WhisperModelSize;
  progress: number;
}

const getService = (): ModelDownloadService => {
  if (!serviceInstance) {
    serviceInstance = new ModelDownloadService();
  }
  return serviceInstance;
};

export const useModelDownloadService = () => {
  return getService();
};

export const useModelDownloadProgress = () => {
  const [activeDownload, setActiveDownload] = useState<ActiveDownload | null>(
    null,
  );
  const [isDownloading, setIsDownloading] = useState(false);
  const progressRef = useRef<number>(0);

  const handleProgress = useCallback(
    (size: WhisperModelSize, progress: number) => {
      progressRef.current = progress;
      setActiveDownload({ size, progress });
      if (progress >= 100) {
        setTimeout(() => {
          setIsDownloading(false);
          setActiveDownload(null);
        }, 500);
      }
    },
    [],
  );

  useEffect(() => {
    const service = getService();
    const unsubscribe = service.addProgressListener(handleProgress);
    return unsubscribe;
  }, [handleProgress]);

  const downloadModel = useCallback(
    async (size: WhisperModelSize): Promise<boolean> => {
      setIsDownloading(true);
      progressRef.current = 0;
      setActiveDownload({ size, progress: 0 });

      const service = getService();
      const result = await service.downloadModel(size);

      if (!result) {
        setIsDownloading(false);
        setActiveDownload(null);
      }

      return result;
    },
    [],
  );

  const cancelDownload = useCallback(async (): Promise<void> => {
    const service = getService();
    await service.cancelDownload();
    setIsDownloading(false);
    setActiveDownload(null);
  }, []);

  return {
    activeDownload,
    isDownloading,
    downloadModel,
    cancelDownload,
  };
};
