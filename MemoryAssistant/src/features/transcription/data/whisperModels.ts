export type WhisperModelSize = 'tiny' | 'base' | 'small' | 'medium';

export interface WhisperModel {
  size: WhisperModelSize;
  name: string;
  bytes: number;
  description: string;
}

export const WHISPER_MODELS: WhisperModel[] = [
  {
    size: 'tiny',
    name: 'Tiny',
    bytes: 75_000_000,
    description: 'Fastest, lowest accuracy',
  },
  {
    size: 'base',
    name: 'Base',
    bytes: 148_000_000,
    description: 'Balanced speed and accuracy',
  },
  {
    size: 'small',
    name: 'Small',
    bytes: 466_000_000,
    description: 'Good accuracy, slower',
  },
  {
    size: 'medium',
    name: 'Medium',
    bytes: 1_500_000_000,
    description: 'Best accuracy, slowest',
  },
];

export const DEFAULT_MODEL: WhisperModelSize = 'base';

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export function getModelBySize(size: WhisperModelSize): WhisperModel {
  return WHISPER_MODELS.find(m => m.size === size) || WHISPER_MODELS[1];
}
