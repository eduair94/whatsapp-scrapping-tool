import toast from 'react-hot-toast';
import { PhoneNumberData } from '../types';
import { AppView } from './AppStateManager';

export interface ElectronAPIFile {
  openFileDialog: () => Promise<{
    error?: string;
    numbers?: PhoneNumberData[];
  }>;
  parseTextInput: (text: string) => Promise<{
    error?: string;
    numbers?: PhoneNumberData[];
  }>;
}

export interface ProcessingCallbacks {
  setIsLoading: (loading: boolean) => void;
  setCurrentView: (view: AppView) => void;
  setProcessingStatus: (status: string) => void;
  setProcessingProgress: (
    progress: number | ((prev: number) => number)
  ) => void;
  setIsAddingMode: (mode: boolean) => void;
  handleNewNumbers: (numbers: PhoneNumberData[]) => void;
  handleAddNumbers: (numbers: PhoneNumberData[]) => void;
}

export class FileProcessingManager {
  constructor(
    private electronAPI: ElectronAPIFile,
    private callbacks: ProcessingCallbacks
  ) {}

  async handleFileUpload(addMode = false): Promise<void> {
    this.callbacks.setIsAddingMode(addMode);
    let progressInterval: NodeJS.Timeout | null = null;

    try {
      this.callbacks.setIsLoading(true);
      this.callbacks.setCurrentView('processing');
      this.callbacks.setProcessingStatus('Reading file...');
      this.callbacks.setProcessingProgress(0);

      // Simulate processing progress
      progressInterval = setInterval(() => {
        this.callbacks.setProcessingProgress((prev) => {
          if (prev >= 90) {
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const result = await this.electronAPI.openFileDialog();

      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }

      // Handle cancellation or no file selected
      if (result.error === 'No file selected') {
        this.callbacks.setCurrentView('welcome');
        this.callbacks.setIsLoading(false);
        this.callbacks.setIsAddingMode(false);
        return;
      }

      if (result.error) {
        toast.error(result.error);
        this.callbacks.setCurrentView('welcome');
        this.callbacks.setIsLoading(false);
        this.callbacks.setIsAddingMode(false);
        return;
      }

      // File was successfully processed - the event listener will handle the result
    } catch (error) {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      console.error('File upload error:', error);
      toast.error('Failed to upload file');
      this.callbacks.setCurrentView('welcome');
      this.callbacks.setIsLoading(false);
      this.callbacks.setIsAddingMode(false);
    }
  }

  async handleTextInput(text: string, isAddingMode: boolean): Promise<void> {
    if (!text.trim()) {
      toast.error('Please enter some phone numbers');
      return;
    }

    let progressInterval: NodeJS.Timeout | null = null;

    try {
      this.callbacks.setIsLoading(true);
      this.callbacks.setCurrentView('processing');
      this.callbacks.setProcessingStatus('Processing text input...');
      this.callbacks.setProcessingProgress(0);

      progressInterval = setInterval(() => {
        this.callbacks.setProcessingProgress((prev) => {
          if (prev >= 90) {
            return 90;
          }
          return prev + 15;
        });
      }, 50);

      const result = await this.electronAPI.parseTextInput(text);

      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }

      this.callbacks.setProcessingProgress(100);

      // Add a small delay to show 100% completion
      setTimeout(() => {
        if (result.error) {
          toast.error(result.error);
          this.callbacks.setCurrentView('welcome');
        } else if (result.numbers) {
          if (isAddingMode) {
            this.callbacks.handleAddNumbers(result.numbers);
          } else {
            this.callbacks.handleNewNumbers(result.numbers);
          }
        } else {
          toast.error('No numbers found in the text');
          this.callbacks.setCurrentView('welcome');
        }
        this.callbacks.setIsLoading(false);
        this.callbacks.setIsAddingMode(false);
      }, 500);
    } catch (error) {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      console.error('Text processing error:', error);
      toast.error('Failed to process text input');
      this.callbacks.setCurrentView('welcome');
      this.callbacks.setIsLoading(false);
      this.callbacks.setIsAddingMode(false);
    }
  }
}
