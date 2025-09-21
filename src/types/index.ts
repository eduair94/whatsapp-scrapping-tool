// Types and interfaces for WhatsApp Number Checker Tool

export interface PhoneNumberData {
  original: string;
  cleaned: string;
  country?: string;
  countryCode?: string;
  isValid: boolean;
  error?: string;
}

export interface WhatsAppResult {
  number: string;
  data:
    | WhatsappPersonResponse
    | WhatsappBusinessResponse
    | { error: string; success: null }
    | null;
  error?: string;
  rateLimitInfo?: RateLimitInfo;
  checkedAt?: Date;
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

export interface FileParseResult {
  fileName: string;
  totalNumbers: number;
  validNumbers: number;
  invalidNumbers: number;
  numbers: PhoneNumberData[];
}

export interface FileUploadResult {
  fileName: string;
  totalRows: number;
  validPhoneNumbers: PhoneNumberData[];
  invalidPhoneNumbers: PhoneNumberData[];
  errors: string[];
}

export interface BulkCheckProgress {
  completed: number;
  total: number;
  currentNumber: string;
  percentage: number;
  successful?: number;
  failed?: number;
  rateLimited?: number;
  estimatedTimeRemaining?: number;
  rateLimitInfo?: RateLimitInfo;
  currentResult?: any;
}

export interface BulkCheckOptions {
  onProgress?: (progress: BulkCheckProgress) => void;
  onComplete?: (results: WhatsAppResult[]) => void;
  onRateLimit?: (info: RateLimitInfo) => void;
  stopOnError?: boolean;
  maxRetries?: number;
}

export interface AppSettings {
  apiKey: string;
  maxRetries: number;
  retryDelay: number;
  timeout: number;
  throwOnLimit: boolean;
  concurrentRequests: number;
  saveResults: boolean;
  autoExport: boolean;
  defaultExportFormat: 'json' | 'csv' | 'xlsx';
  theme: 'light' | 'dark';
  baseURL?: string;
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
  results: WhatsAppResult[];
  settings: AppSettings;
  status: 'pending' | 'running' | 'completed' | 'cancelled' | 'error';
}

export interface ExportOptions {
  format: 'json' | 'csv' | 'xlsx';
  includeErrors?: boolean;
  includeDetails?: boolean;
  filterWhatsAppOnly?: boolean;
  fileName?: string;
}

export interface ValidationError {
  row: number;
  column: string;
  value: string;
  error: string;
}

export interface ParsedFileData {
  headers: string[];
  phoneNumbers: string[];
  errors: ValidationError[];
  totalRows: number;
  validRows: number;
}

// Electron IPC Events
export interface IpcEvents {
  // Main to Renderer
  'file-uploaded': FileUploadResult;
  'check-progress': BulkCheckProgress;
  'check-completed': CheckSession;
  'settings-updated': AppSettings;
  'export-completed': { success: boolean; filePath?: string; error?: string };

  // Renderer to Main
  'upload-file': { filePath: string };
  'start-bulk-check': {
    phoneNumbers: PhoneNumberData[];
    settings: AppSettings;
  };
  'cancel-check': void;
  'update-settings': Partial<AppSettings>;
  'export-results': { sessionId: string; options: ExportOptions };
  'get-sessions': void;
  'delete-session': { sessionId: string };
}

// WhatsApp API Response Types (from the package documentation)
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

export interface CheckResult {
  number: string;
  data:
    | WhatsappPersonResponse
    | WhatsappBusinessResponse
    | { error: string; success: null }
    | null;
  error?: string;
  rateLimitInfo?: RateLimitInfo;
}
