import toast from 'react-hot-toast';
import {
  AppSettings,
  BulkCheckProgress,
  CheckSession,
  PhoneNumberData,
} from '../types';
import { AppView } from './AppStateManager';

export interface ElectronAPICheck {
  startBulkCheck: (
    numbers: PhoneNumberData[],
    settings: AppSettings,
    sessionId: string
  ) => Promise<void>;
  cancelCheck: () => Promise<void>;
  exportResults: (
    sessionId: string,
    options: {
      format: 'csv' | 'json' | 'xlsx';
      fileName: string;
      includeDetails: boolean;
    }
  ) => Promise<{ success: boolean; filePath?: string; error?: string }>;
}

export interface CheckingCallbacks {
  setCurrentView: (view: AppView) => void;
  setCheckProgress: (progress: BulkCheckProgress | null) => void;
}

export class CheckingManager {
  constructor(
    private electronAPI: ElectronAPICheck,
    private callbacks: CheckingCallbacks
  ) {}

  async startBulkCheck(
    phoneNumbers: PhoneNumberData[],
    settings: AppSettings | null,
    session: CheckSession
  ): Promise<void> {
    if (!settings?.apiKey) {
      toast.error('Please configure your API key in settings first');
      return;
    }

    const validNumbers = phoneNumbers.filter((n) => n.isValid);
    if (validNumbers.length === 0) {
      toast.error('No valid numbers to check');
      return;
    }

    try {
      this.callbacks.setCurrentView('checking');
      this.callbacks.setCheckProgress({
        completed: 0,
        total: validNumbers.length,
        currentNumber: '',
        percentage: 0,
        successful: 0,
        failed: 0,
        rateLimited: 0,
      });

      await this.electronAPI.startBulkCheck(validNumbers, settings, session.id);
    } catch (error) {
      console.error('Bulk check error:', error);
      toast.error('Failed to start bulk check');
      this.callbacks.setCurrentView('preview');
    }
  }

  async cancelCheck(): Promise<void> {
    try {
      await this.electronAPI.cancelCheck();
      toast('Check cancelled');
      this.callbacks.setCurrentView('preview');
      this.callbacks.setCheckProgress(null);
    } catch (error) {
      console.error('Cancel check error:', error);
      toast.error('Failed to cancel check');
    }
  }

  async exportResults(
    sessionId: string,
    format: 'csv' | 'json' | 'xlsx'
  ): Promise<void> {
    try {
      const defaultFileName = `whatsapp-check-${sessionId}-${
        new Date().toISOString().split('T')[0]
      }`;
      const result = await this.electronAPI.exportResults(sessionId, {
        format,
        fileName: defaultFileName,
        includeDetails: true,
      });

      if (result.success) {
        toast.success(`Results exported successfully to ${result.filePath}`);
      } else {
        toast.error(result.error || 'Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Failed to export as ${format.toUpperCase()}`);
    }
  }

  cleanNumbers(phoneNumbers: PhoneNumberData[]): PhoneNumberData[] {
    const cleanedNumbers = phoneNumbers.filter((n) => n.isValid);
    toast.success(
      `Removed ${phoneNumbers.length - cleanedNumbers.length} invalid numbers`
    );
    return cleanedNumbers;
  }
}
