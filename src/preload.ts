import { contextBridge, ipcRenderer } from 'electron';
import {
  AppSettings,
  BulkCheckProgress,
  CheckSession,
  ExportOptions,
  FileParseResult,
  PhoneNumberData,
  RateLimitInfo,
} from './types';

// Define the API that will be exposed to the renderer process
const electronAPI = {
  // File operations
  openFileDialog: (): Promise<{
    error?: string;
    numbers?: PhoneNumberData[];
  }> =>
    ipcRenderer.invoke('upload-file').then((result) => {
      if (!result) return { error: 'No file selected' };
      return { numbers: result.numbers };
    }),

  parseTextInput: (
    textInput: string
  ): Promise<{ error?: string; numbers?: PhoneNumberData[] }> =>
    ipcRenderer.invoke('process-text-input', textInput).then((result) => {
      if (!result) return { error: 'Failed to parse text input' };
      return { numbers: result.numbers };
    }),

  // Generate random phone numbers
  generateRandomNumbers: (
    country: string,
    quantity: number
  ): Promise<{ error?: string; numbers?: PhoneNumberData[] }> =>
    ipcRenderer.invoke('generate-random-numbers', country, quantity),

  // WhatsApp checking operations
  startBulkCheck: (
    phoneNumbers: PhoneNumberData[],
    settings: AppSettings,
    sessionId?: string
  ): Promise<void> =>
    ipcRenderer
      .invoke('start-bulk-check', phoneNumbers, settings, sessionId)
      .then(() => {}),

  cancelCheck: (): Promise<void> => ipcRenderer.invoke('cancel-check'),

  // Settings operations
  getSettings: (): Promise<AppSettings> => ipcRenderer.invoke('get-settings'),

  updateSettings: (settings: Partial<AppSettings>): Promise<AppSettings> =>
    ipcRenderer.invoke('update-settings', settings),

  // Session operations
  getSessions: (): Promise<CheckSession[]> =>
    ipcRenderer.invoke('get-sessions'),

  saveSession: (session: CheckSession): Promise<void> =>
    ipcRenderer.invoke('save-session', session),

  deleteSession: (sessionId: string): Promise<boolean> =>
    ipcRenderer.invoke('delete-session', sessionId),

  // Export operations
  exportResults: (
    sessionId: string,
    options: ExportOptions
  ): Promise<{ success: boolean; filePath?: string; error?: string }> =>
    ipcRenderer.invoke('export-results', sessionId, options),

  // Event listeners
  onFileUploaded: (callback: (result: FileParseResult) => void) => {
    ipcRenderer.on('file-uploaded', (_, result) => callback(result));
  },

  onCheckProgress: (callback: (progress: BulkCheckProgress) => void) => {
    ipcRenderer.on('check-progress', (_, progress) => callback(progress));
  },

  onCheckCompleted: (callback: (session: CheckSession) => void) => {
    ipcRenderer.on('check-completed', (_, session) => callback(session));
  },

  onRateLimitUpdate: (callback: (rateLimitInfo: RateLimitInfo) => void) => {
    ipcRenderer.on('rate-limit-update', (_, rateLimitInfo) =>
      callback(rateLimitInfo)
    );
  },

  onSettingsUpdated: (callback: (settings: AppSettings) => void) => {
    ipcRenderer.on('settings-updated', (_, settings) => callback(settings));
  },

  onExportCompleted: (
    callback: (result: {
      success: boolean;
      filePath?: string;
      error?: string;
    }) => void
  ) => {
    ipcRenderer.on('export-completed', (_, result) => callback(result));
  },

  onShowExportDialog: (callback: () => void) => {
    ipcRenderer.on('show-export-dialog', () => callback());
  },

  // Remove event listeners
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },

  // Utility functions
  getAppVersion: (): Promise<string> => ipcRenderer.invoke('get-app-version'),

  openExternal: (url: string): Promise<void> =>
    ipcRenderer.invoke('open-external', url),

  showMessageBox: (
    options: Electron.MessageBoxOptions
  ): Promise<Electron.MessageBoxReturnValue> =>
    ipcRenderer.invoke('show-message-box', options),
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// Also expose types for TypeScript support in renderer
export type ElectronAPI = typeof electronAPI;
