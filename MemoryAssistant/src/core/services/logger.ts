import { Platform } from 'react-native';

export type LogLevel = 'error' | 'info' | 'debug' | 'trace';

export interface LogEntry {
  level: LogLevel;
  tag: string;
  message: string;
  data?: any;
  timestamp: Date;
  platform: string;
}

class LoggerService {
  private isDebugMode: boolean;
  private minLevel: LogLevel;

  constructor() {
    this.isDebugMode = __DEV__;
    this.minLevel = 'error';
  }

  setDebugMode(enabled: boolean): void {
    this.isDebugMode = enabled;
  }

  setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  isDebug(): boolean {
    return this.isDebugMode;
  }

  getMinLevel(): LogLevel {
    return this.minLevel;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['error', 'info', 'debug', 'trace'];
    const currentLevelIndex = levels.indexOf(this.minLevel);
    const messageLevelIndex = levels.indexOf(level);
    return this.isDebugMode && messageLevelIndex >= currentLevelIndex;
  }

  error(tag: string, message: string, data?: any): void {
    if (this.shouldLog('error')) {
      console.error(`[${tag}] ❌ ${message}`, data ?? '');
    }
  }

  info(tag: string, message: string, data?: any): void {
    if (this.shouldLog('info')) {
      console.log(`[${tag}] ℹ️ ${message}`, data ?? '');
    }
  }

  debug(tag: string, message: string, data?: any): void {
    if (this.shouldLog('debug')) {
      console.log(`[${tag}] 🔍 ${message}`, data ?? '');
    }
  }

  trace(tag: string, message: string, data?: any): void {
    if (this.shouldLog('trace')) {
      console.log(`[${tag}] 📍 ${message}`, data ?? '');
    }
  }

  warn(tag: string, message: string, data?: any): void {
    if (this.shouldLog('error')) {
      console.warn(`[${tag}] ⚠️ ${message}`, data ?? '');
    }
  }

  captureLog(entry: Omit<LogEntry, 'timestamp' | 'platform'>): void {
    const fullEntry: LogEntry = {
      ...entry,
      timestamp: new Date(),
      platform: Platform.OS,
    };
  }
}

export const logger = new LoggerService();
