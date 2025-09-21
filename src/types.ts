// Type definitions for WhatsApp Number Checker

export interface AppSettings {
  apiKey: string;
  maxRetries: number;
  timeout: number;
  throwOnLimit: boolean;
  retryDelay?: number;
  baseURL?: string;

  concurrentRequests?: number;

  saveResults?: boolean;

  autoExport?: boolean;

  defaultExportFormat?: string;

  theme?: string;
}

export interface PhoneNumberData {
  original: string;
  cleaned: string;
  country?: string;
  countryCode?: string;
  isValid: boolean;
  error?: string;
}

export interface FileParseResult {
  fileName: string;
  totalNumbers: number;
  validNumbers: number;
  invalidNumbers: number;
  numbers: PhoneNumberData[];
  errors?: string[];
}

export interface WhatsAppCheckResult {
  number: string;
  data:
    | WhatsappPersonResponse
    | WhatsappBusinessResponse
    | { error: string; success: null }
    | null;
  error?: string;
  rateLimitInfo?: RateLimitInfo;
}

export interface WhatsappPersonResponse {
  _id: string;
  number: string;
  about: string;
  countryCode: string;
  isBlocked: boolean;
  isBusiness: boolean;
  isEnterprise: boolean;
  isGroup: boolean;
  isMe: boolean;
  isMyContact: boolean;
  isUser: boolean;
  isWAContact: boolean;
  name: string;
  phone: string;
  profilePic: string;
  pushname: string;
  shortName: string;
  type: string;
}

export interface WhatsappBusinessResponse {
  number: string;
  isBusiness: boolean;
  isEnterprise: boolean;
  isUser: boolean;
  isWAContact: boolean;
  name: string;
  shortName: string;
  verifiedLevel: number;
  verifiedName: string;
  countryCode: string;
  phone: string;
  businessProfile: BusinessProfile;
}

export interface BusinessProfile {
  description: string;
  email: string;
  category: string;
  address: string;
  website: string;
}

export interface RateLimitInfo {
  remaining: number;
  limit: number;
  reset: number;
  used: number;
  monthlyRemaining: number;
  monthlyLimit: number;
  monthlyReset: number;
  monthlyUsed: number;
}

export interface BulkCheckProgress {
  completed: number;
  total: number;
  successful: number;
  failed: number;
  rateLimited?: number;
  currentNumber?: string;
  currentResult?: WhatsAppCheckResult;
  percentage?: number;
}

export interface BulkCheckOptions {
  onProgress?: (progress: BulkCheckProgress) => void;
  onComplete?: (results: WhatsAppCheckResult[]) => void;
  onRateLimit?: (info: RateLimitInfo) => void;
  stopOnError?: boolean;
  maxRetries?: number;
}

export interface CheckSession {
  id: string;
  fileName: string;
  startTime: Date;
  endTime?: Date;
  totalNumbers: number;
  completedNumbers: number;
  successfulChecks: number;
  failedChecks: number;
  results: WhatsAppCheckResult[];
  settings: AppSettings;
  status: 'running' | 'completed' | 'cancelled' | 'error';
}

export interface ExportOptions {
  format: 'json' | 'csv' | 'xlsx';
  fileName?: string;
  includeErrors?: boolean;
  includeDetails?: boolean;
  filterWhatsAppOnly?: boolean;
}

export interface ElectronAPI {
  uploadFile: () => Promise<FileParseResult | null>;
  startBulkCheck: (
    numbers: PhoneNumberData[],
    settings: AppSettings
  ) => Promise<boolean>;
  cancelCheck: () => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<AppSettings>;
  getSettings: () => Promise<AppSettings>;
  exportResults: (
    sessionId: string,
    options: ExportOptions
  ) => Promise<{ success: boolean; filePath?: string; error?: string }>;
  getSessions: () => Promise<CheckSession[]>;
  deleteSession: (sessionId: string) => Promise<boolean>;

  // Event listeners
  onFileUploaded: (callback: (result: FileParseResult) => void) => void;
  onCheckProgress: (callback: (progress: BulkCheckProgress) => void) => void;
  onCheckCompleted: (callback: (session: CheckSession) => void) => void;
  onSettingsUpdated: (callback: (settings: AppSettings) => void) => void;
  onShowExportDialog: (callback: () => void) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
