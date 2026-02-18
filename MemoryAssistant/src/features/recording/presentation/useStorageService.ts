import { StorageService } from '../data/storageService';

let instance: StorageService | null = null;

export const useStorageService = () => {
  if (!instance) {
    instance = new StorageService();
  }
  return instance;
};
