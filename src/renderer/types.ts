// Enhanced types for the React application
import {
  CheckResult,
  RateLimitInfo as LibRateLimitInfo,
} from 'whatsapp-number-checker';

// Extend the library's RateLimitInfo for our UI needs
export interface RateLimitInfo extends LibRateLimitInfo {
  resetTime?: Date;
}

export interface PhoneNumberData {
  original: string;
  cleaned: string;
  country?: string;
  countryCode?: string;
  isValid: boolean;
  error?: string;
}

export interface WhatsAppResult extends CheckResult {
  checkedAt?: Date;
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
  labels: any[];
  hasUrlImage: boolean;
  urlImage: string;
}

export interface WhatsappBusinessResponse {
  businessProfile: BusinessProfile;
  number: string;
  isBusiness: boolean;
  isEnterprise: boolean;
  labels: any[];
  name: string;
  shortName: string;
  verifiedLevel: number;
  verifiedName: string;
  isMe: boolean;
  isUser: boolean;
  isGroup: boolean;
  isWAContact: boolean;
  isMyContact: boolean;
  isBlocked: boolean;
  profilePic: string;
  about: string | null;
  countryCode: string;
  phone: string;
  urlImage: string;
}

export interface BusinessProfile {
  description: string;
  categories: Array<{
    id: string;
    localized_display_name: string;
  }>;
  website: Array<{
    url: string;
  }>;
  email: string | null;
  address: string | null;
  businessHours: any;
  isProfileLinked: boolean;
  memberSinceText: string;
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

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  resetTime?: Date;
}

export interface BulkCheckProgress {
  completed: number;
  total: number;
  currentNumber: string;
  percentage: number;
  successful: number;
  failed: number;
  rateLimited: number;
  rateLimitInfo?: RateLimitInfo;
}

export interface FileParseResult {
  fileName: string;
  totalNumbers: number;
  validNumbers: number;
  invalidNumbers: number;
  numbers: PhoneNumberData[];
}

export interface ExportOptions {
  format: 'json' | 'csv' | 'xlsx';
  fileName?: string;
  includeErrors?: boolean;
  includeDetails?: boolean;
  filterWhatsAppOnly?: boolean;
}

// Component Props Interfaces
export interface NumberListProps {
  numbers: PhoneNumberData[];
  onAddNumbers: (newNumbers: PhoneNumberData[]) => void;
  onRemoveNumbers: (indices: number[]) => void;
  onStartCheck: () => void;
  isChecking: boolean;
}

export interface ResultsTableProps {
  results: WhatsAppResult[];
  onViewDetails: (result: WhatsAppResult) => void;
  filter?: 'all' | 'whatsapp' | 'no-whatsapp' | 'errors';
}

export interface DetailsModalProps {
  result: WhatsAppResult | null;
  isOpen: boolean;
  onClose: () => void;
}

export interface RateLimitDisplayProps {
  rateLimitInfo: RateLimitInfo | null;
  isVisible: boolean;
}
