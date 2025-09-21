import { useEffect, useState } from 'react';
import {
  AppSettings,
  BulkCheckProgress,
  CheckSession,
  ExportOptions,
  PhoneNumberData,
  RateLimitInfo,
} from '../types';

// Type definitions for Electron API
interface ElectronAPI {
  // File operations
  openFileDialog: () => Promise<{
    error?: string;
    numbers?: PhoneNumberData[];
  }>;
  parseTextInput: (
    text: string
  ) => Promise<{ error?: string; numbers?: PhoneNumberData[] }>;
  generateRandomNumbers: (
    country: string,
    quantity: number
  ) => Promise<{ error?: string; numbers?: PhoneNumberData[] }>;

  // WhatsApp checking
  startBulkCheck: (
    numbers: PhoneNumberData[],
    settings: AppSettings,
    sessionId?: string
  ) => Promise<void>;
  cancelCheck: () => Promise<void>;

  // Settings
  getSettings: () => Promise<AppSettings>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<AppSettings>;

  // History and export
  getSessions: () => Promise<CheckSession[]>;
  saveSession: (session: CheckSession) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<boolean>;
  exportResults: (
    sessionId: string,
    options: ExportOptions
  ) => Promise<{ success: boolean; filePath?: string; error?: string }>;

  // Event listeners
  onFileUploaded: (
    callback: (result: { error?: string; numbers?: PhoneNumberData[] }) => void
  ) => void;
  onCheckProgress: (callback: (progress: BulkCheckProgress) => void) => void;
  onCheckCompleted: (callback: (session: CheckSession) => void) => void;
  onRateLimitUpdate: (callback: (rateLimitInfo: RateLimitInfo) => void) => void;
  onSettingsUpdated: (callback: (settings: AppSettings) => void) => void;

  // Remove listeners
  removeAllListeners: (channel: string) => void;
}

const createMockAPI = (): ElectronAPI => ({
  openFileDialog: async () => ({ error: 'Electron API not available' }),
  parseTextInput: async () => ({ error: 'Electron API not available' }),
  generateRandomNumbers: async () => ({ error: 'Electron API not available' }),
  startBulkCheck: async () => {},
  cancelCheck: async () => {},
  getSettings: async () => ({
    apiKey: '',
    timeout: 10000,
    maxRetries: 3,
    retryDelay: 1000,
    throwOnLimit: false,
    concurrentRequests: 1,
    saveResults: true,
    autoExport: false,
    defaultExportFormat: 'csv' as const,
    theme: 'light' as const,
  }),
  updateSettings: async (settings) => {
    const defaultSettings = {
      apiKey: '',
      timeout: 10000,
      maxRetries: 3,
      retryDelay: 1000,
      throwOnLimit: false,
      concurrentRequests: 1,
      saveResults: true,
      autoExport: false,
      defaultExportFormat: 'csv' as const,
      theme: 'light' as const,
    };
    return { ...defaultSettings, ...settings };
  },
  getSessions: async () => [],
  saveSession: async () => {},
  deleteSession: async () => false,
  exportResults: async () => ({
    success: false,
    error: 'Electron API not available',
  }),
  onFileUploaded: () => {},
  onCheckProgress: () => {},
  onCheckCompleted: () => {},
  onRateLimitUpdate: () => {},
  onSettingsUpdated: () => {},
  removeAllListeners: () => {},
});

// Singleton pattern to avoid multiple listener registrations
let electronAPIInstance: ElectronAPI | null = null;

export const useElectronAPI = (): ElectronAPI => {
  const [api] = useState<ElectronAPI>(() => {
    if (electronAPIInstance) {
      return electronAPIInstance;
    }

    if (
      typeof window !== 'undefined' &&
      (window as unknown as { electronAPI?: ElectronAPI }).electronAPI
    ) {
      electronAPIInstance = (window as unknown as { electronAPI: ElectronAPI })
        .electronAPI;
      return electronAPIInstance;
    }

    electronAPIInstance = createMockAPI();
    return electronAPIInstance;
  });

  useEffect(() => {
    // Only set up cleanup on the first instance
    if (api === electronAPIInstance) {
      return () => {
        if (api.removeAllListeners) {
          api.removeAllListeners('file-uploaded');
          api.removeAllListeners('check-progress');
          api.removeAllListeners('check-completed');
          api.removeAllListeners('settings-updated');
        }
      };
    }
    // Return empty cleanup function for non-primary instances
    return () => {};
  }, [api]);

  return api;
};
