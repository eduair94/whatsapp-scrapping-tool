import { useRef, useState } from 'react';
import {
  AppSettings,
  BulkCheckProgress,
  CheckSession,
  PhoneNumberData,
  WhatsAppResult,
} from '../types';

export type AppView =
  | 'welcome'
  | 'processing'
  | 'preview'
  | 'checking'
  | 'results';

export interface AppState {
  currentView: AppView;
  phoneNumbers: PhoneNumberData[];
  checkResults: WhatsAppResult[];
  currentSession: CheckSession | null;
  checkProgress: BulkCheckProgress | null;
  settings: AppSettings | null;
  isSettingsOpen: boolean;
  isHistoryOpen: boolean;
  isLoading: boolean;
  processingProgress: number;
  processingStatus: string;
  isAddingMode: boolean;
  selectedResult: WhatsAppResult | null;
  isDetailsModalOpen: boolean;
}

export interface AppRefs {
  completedSessionIds: React.MutableRefObject<Set<string>>;
  loadedFileIds: React.MutableRefObject<Set<string>>;
  currentSessionRef: React.MutableRefObject<CheckSession | null>;
}

export const useAppState = () => {
  const [currentView, setCurrentView] = useState<AppView>('welcome');
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumberData[]>([]);
  const [checkResults, setCheckResults] = useState<WhatsAppResult[]>([]);
  const [currentSession, setCurrentSession] = useState<CheckSession | null>(
    null
  );
  const [checkProgress, setCheckProgress] = useState<BulkCheckProgress | null>(
    null
  );
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStatus, setProcessingStatus] = useState('');
  const [isAddingMode, setIsAddingMode] = useState(false);
  const [selectedResult, setSelectedResult] = useState<WhatsAppResult | null>(
    null
  );
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const completedSessionIds = useRef(new Set<string>());
  const loadedFileIds = useRef(new Set<string>());
  const currentSessionRef = useRef<CheckSession | null>(null);

  const state: AppState = {
    currentView,
    phoneNumbers,
    checkResults,
    currentSession,
    checkProgress,
    settings,
    isSettingsOpen,
    isHistoryOpen,
    isLoading,
    processingProgress,
    processingStatus,
    isAddingMode,
    selectedResult,
    isDetailsModalOpen,
  };

  const refs: AppRefs = {
    completedSessionIds,
    loadedFileIds,
    currentSessionRef,
  };

  const actions = {
    setCurrentView,
    setPhoneNumbers,
    setCheckResults,
    setCurrentSession,
    setCheckProgress,
    setSettings,
    setIsSettingsOpen,
    setIsHistoryOpen,
    setIsLoading,
    setProcessingProgress,
    setProcessingStatus,
    setIsAddingMode,
    setSelectedResult,
    setIsDetailsModalOpen,
  };

  return { state, refs, actions };
};
