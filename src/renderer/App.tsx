import React, { useCallback, useEffect, useMemo } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { CheckingSection } from './components/CheckingSection';
import { Header } from './components/Header';
import { HistoryModal } from './components/HistoryModal';
import { LoadingOverlay } from './components/LoadingOverlay';
import { PreviewSection } from './components/PreviewSection';
import { ProcessingSection } from './components/ProcessingSection';
import { RateLimitBar } from './components/RateLimitBar';
import { ResultsSection } from './components/ResultsSection';
import { SettingsModal } from './components/SettingsModal';
import { WelcomeSection } from './components/WelcomeSection';
import { WhatsAppDetailsModal } from './components/WhatsAppDetailsModal';
import { useElectronAPI } from './hooks/useElectronAPI';
import { useSessionManager } from './hooks/useSessionManager';
import {
  AppSettings,
  CheckSession,
  PhoneNumberData,
  WhatsAppResult,
} from './types';

// Import managers
import { useAppState } from './managers/AppStateManager';
import { CheckingManager, ElectronAPICheck } from './managers/CheckingManager';
import {
  ElectronAPIFile,
  FileProcessingManager,
} from './managers/FileProcessingManager';
import { NumberProcessingUtils } from './managers/NumberProcessingUtils';
import {
  ElectronAPISession,
  SessionOperations,
} from './managers/SessionManager';

const App: React.FC = () => {
  const { state, refs, actions } = useAppState();
  const electronAPI = useElectronAPI();
  const sessionManager = useSessionManager();

  // Create manager instances with useMemo to prevent recreating on every render
  const sessionOperations = useMemo(
    () =>
      new SessionOperations(
        {
          addSession: sessionManager.addSession,
          updateSessionById: sessionManager.updateSessionById,
          loadSessions: sessionManager.loadSessions,
        },
        electronAPI as ElectronAPISession
      ),
    [sessionManager, electronAPI]
  );

  // Core number handling functions
  const handleNewNumbers = useCallback(
    async (numbers: PhoneNumberData[]) => {
      const numbersKey = NumberProcessingUtils.generateNumbersKey(numbers);

      NumberProcessingUtils.preventDuplicateToasts(
        refs.loadedFileIds,
        numbersKey,
        async () => {
          actions.setPhoneNumbers(numbers);
          actions.setCurrentView('preview');
          toast.success(`Successfully loaded ${numbers.length} phone numbers`);
          const session = await sessionOperations.createPendingSession(
            numbers,
            state.settings
          );
          if (session) {
            actions.setCurrentSession(session);
            refs.currentSessionRef.current = session;
          }
        },
        async () => {
          actions.setPhoneNumbers(numbers);
          actions.setCurrentView('preview');
          const session = await sessionOperations.createPendingSession(
            numbers,
            state.settings
          );
          if (session) {
            actions.setCurrentSession(session);
            refs.currentSessionRef.current = session;
          }
        }
      );
    },
    [
      actions,
      refs.loadedFileIds,
      refs.currentSessionRef,
      sessionOperations,
      state.settings,
    ]
  );

  const handleAddNumbers = useCallback(
    (newNumbers: PhoneNumberData[]) => {
      const { uniqueNumbers, duplicateCount } =
        NumberProcessingUtils.filterDuplicates(state.phoneNumbers, newNumbers);

      if (uniqueNumbers.length === 0) {
        toast.error('All numbers are already in the current list');
        return;
      }

      const combinedNumbers = [...state.phoneNumbers, ...uniqueNumbers];
      actions.setPhoneNumbers(combinedNumbers);
      actions.setCurrentView('preview');

      NumberProcessingUtils.showDuplicateToast(
        uniqueNumbers.length,
        duplicateCount,
        combinedNumbers.length
      );
    },
    [state.phoneNumbers, actions]
  );

  const fileProcessingManager = useMemo(
    () =>
      new FileProcessingManager(electronAPI as ElectronAPIFile, {
        setIsLoading: actions.setIsLoading,
        setCurrentView: actions.setCurrentView,
        setProcessingStatus: actions.setProcessingStatus,
        setProcessingProgress: actions.setProcessingProgress,
        setIsAddingMode: actions.setIsAddingMode,
        handleNewNumbers,
        handleAddNumbers,
      }),
    [electronAPI, actions, handleNewNumbers, handleAddNumbers]
  );

  const checkingManager = useMemo(
    () =>
      new CheckingManager(electronAPI as ElectronAPICheck, {
        setCurrentView: actions.setCurrentView,
        setCheckProgress: actions.setCheckProgress,
      }),
    [electronAPI, actions]
  );

  // Event handlers
  const handleFileUpload = useCallback(
    async (addMode = false) => {
      await fileProcessingManager.handleFileUpload(addMode);
    },
    [fileProcessingManager]
  );

  const handleTextInput = useCallback(
    async (text: string) => {
      await fileProcessingManager.handleTextInput(text, state.isAddingMode);
    },
    [fileProcessingManager, state.isAddingMode]
  );

  const handleStartCheck = useCallback(async () => {
    if (!state.settings?.apiKey) {
      toast.error('Please configure your API key in settings first');
      actions.setIsSettingsOpen(true);
      return;
    }

    const validNumbers = state.phoneNumbers.filter((n) => n.isValid);
    if (validNumbers.length === 0) {
      toast.error('No valid numbers to check');
      return;
    }

    try {
      // Use existing session if available, otherwise create a new one
      let session = state.currentSession;

      if (!session || session.status !== 'pending') {
        // Only create a new session if there's no pending session
        session = await sessionOperations.createSessionForCheck(
          validNumbers,
          state.settings
        );
        actions.setCurrentSession(session);
        refs.currentSessionRef.current = session;
      } else {
        // Update existing pending session with current settings
        const updatedSession = {
          ...session,
          totalNumbers: validNumbers.length,
          settings: state.settings,
        };
        sessionOperations.updateSession(updatedSession);
        actions.setCurrentSession(updatedSession);
        refs.currentSessionRef.current = updatedSession;
        toast.success(`Starting check with ${validNumbers.length} numbers`);
      }

      await checkingManager.startBulkCheck(
        state.phoneNumbers,
        state.settings,
        session
      );
    } catch (error) {
      console.error('Start check error:', error);
      toast.error('Failed to start bulk check');
      actions.setCurrentView('preview');
    }
  }, [
    state.settings,
    state.phoneNumbers,
    state.currentSession,
    actions,
    refs.currentSessionRef,
    sessionOperations,
    checkingManager,
  ]);

  const handleCancelCheck = useCallback(async () => {
    await checkingManager.cancelCheck();

    // Update session status
    const updatedSession = sessionOperations.cancelSession(
      refs.currentSessionRef.current
    );
    if (updatedSession) {
      actions.setCurrentSession(updatedSession);
      refs.currentSessionRef.current = updatedSession;
    }
  }, [checkingManager, sessionOperations, actions, refs.currentSessionRef]);

  const handleNewCheck = useCallback(() => {
    actions.setPhoneNumbers([]);
    actions.setCheckResults([]);
    actions.setCurrentSession(null);
    actions.setCheckProgress(null);
    actions.setCurrentView('welcome');
  }, [actions]);

  const handleSaveSettings = useCallback(
    async (newSettings: Partial<AppSettings>) => {
      try {
        const updated = await electronAPI.updateSettings(newSettings);
        actions.setSettings(updated);
        actions.setIsSettingsOpen(false);
        toast.success('Settings saved successfully');
      } catch (error) {
        console.error('Save settings error:', error);
        toast.error('Failed to save settings');
      }
    },
    [electronAPI, actions]
  );

  const cleanNumbers = useCallback(() => {
    const cleanedNumbers = checkingManager.cleanNumbers(state.phoneNumbers);
    actions.setPhoneNumbers(cleanedNumbers);
  }, [checkingManager, state.phoneNumbers, actions]);

  const handleExportResults = useCallback(
    async (format: 'csv' | 'json' | 'xlsx', sessionToExport?: CheckSession) => {
      const session = sessionToExport || state.currentSession;
      if (!session) {
        toast.error('No session to export');
        return;
      }
      await checkingManager.exportResults(session.id, format);
    },
    [checkingManager, state.currentSession]
  );

  const handleViewDetails = useCallback(
    (result: WhatsAppResult) => {
      actions.setSelectedResult(result);
      actions.setIsDetailsModalOpen(true);
    },
    [actions]
  );

  const handleGoHome = useCallback(() => {
    actions.setCurrentView('welcome');
    actions.setIsAddingMode(false);
  }, [actions]);

  // Effects
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const loadedSettings = await electronAPI.getSettings();
        actions.setSettings(loadedSettings);
      } catch (error) {
        console.error('Failed to load settings:', error);
        toast.error('Failed to load settings');
      }
    };

    const setupEventListeners = () => {
      // Clear existing listeners first to prevent duplicates
      electronAPI.removeAllListeners('file-uploaded');
      electronAPI.removeAllListeners('check-progress');
      electronAPI.removeAllListeners('check-completed');
      electronAPI.removeAllListeners('settings-updated');

      electronAPI.onFileUploaded((result) => {
        if (result.error) {
          toast.error(result.error);
          actions.setCurrentView('welcome');
        } else if (result.numbers) {
          if (state.isAddingMode) {
            handleAddNumbers(result.numbers);
          } else {
            handleNewNumbers(result.numbers);
          }
        }
        actions.setIsLoading(false);
        actions.setIsAddingMode(false);
      });

      electronAPI.onCheckProgress((progress) => {
        actions.setCheckProgress(progress);

        // Update the pending session with progress
        const updatedSession = sessionOperations.updateSessionProgress(
          refs.currentSessionRef.current,
          progress
        );
        if (updatedSession) {
          actions.setCurrentSession(updatedSession);
          refs.currentSessionRef.current = updatedSession;
        }
      });

      electronAPI.onCheckCompleted((session) => {
        // Update the existing pending session instead of adding a new one
        const updatedSession = sessionOperations.completeSession(
          refs.currentSessionRef.current,
          session
        );

        actions.setCurrentSession(updatedSession);
        refs.currentSessionRef.current = updatedSession;
        actions.setCheckResults(session.results);
        actions.setCurrentView('results');
        actions.setCheckProgress(null);

        // Only show toast if we haven't shown one for this session
        const sessionIdToCheck =
          refs.currentSessionRef.current?.id || session.id;
        if (!refs.completedSessionIds.current.has(sessionIdToCheck)) {
          toast.success('WhatsApp number check completed!');
          refs.completedSessionIds.current.add(sessionIdToCheck);
        }
      });

      electronAPI.onSettingsUpdated((updatedSettings) => {
        actions.setSettings(updatedSettings);
      });
    };

    loadSettings();
    setupEventListeners();

    // Cleanup function
    return () => {
      electronAPI.removeAllListeners('file-uploaded');
      electronAPI.removeAllListeners('check-progress');
      electronAPI.removeAllListeners('check-completed');
      electronAPI.removeAllListeners('settings-updated');
    };
  }, [
    electronAPI,
    state.isAddingMode,
    handleAddNumbers,
    handleNewNumbers,
    sessionOperations,
    actions,
    refs,
  ]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <RateLimitBar />
      <Header
        onOpenSettings={() => actions.setIsSettingsOpen(true)}
        onOpenHistory={() => actions.setIsHistoryOpen(true)}
        onGoHome={handleGoHome}
      />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {state.currentView === 'welcome' && (
          <WelcomeSection
            onFileUpload={handleFileUpload}
            onTextSubmit={handleTextInput}
            onRandomNumbers={(numbers: PhoneNumberData[]) => {
              if (state.isAddingMode) {
                handleAddNumbers(numbers);
              } else {
                handleNewNumbers(numbers);
              }
            }}
            isAddingMode={state.isAddingMode}
          />
        )}

        {state.currentView === 'processing' && (
          <ProcessingSection
            progress={state.processingProgress}
            status={state.processingStatus}
          />
        )}

        {state.currentView === 'preview' && (
          <PreviewSection
            numbers={state.phoneNumbers}
            onStartCheck={handleStartCheck}
            onCleanNumbers={cleanNumbers}
            onGoHome={handleNewCheck}
            onAddMoreNumbers={() => {
              actions.setIsAddingMode(true);
              actions.setCurrentView('welcome');
            }}
          />
        )}

        {state.currentView === 'checking' && (
          <CheckingSection
            progress={state.checkProgress}
            onCancel={handleCancelCheck}
          />
        )}

        {state.currentView === 'results' && (
          <ResultsSection
            session={state.currentSession}
            results={state.checkResults}
            onNewCheck={handleNewCheck}
            onExportResults={handleExportResults}
            onViewDetails={handleViewDetails}
          />
        )}
      </main>

      <SettingsModal
        isOpen={state.isSettingsOpen}
        settings={state.settings}
        onClose={() => actions.setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
      />

      <HistoryModal
        isOpen={state.isHistoryOpen}
        onClose={() => actions.setIsHistoryOpen(false)}
        sessions={sessionManager.sessions}
        onResumeSession={sessionManager.resumeSession}
        onPauseSession={sessionManager.pauseSession}
        onToggleStar={async (session: CheckSession) => {
          const success = await sessionManager.toggleStarSession(session);
          if (success) {
            toast.success(
              session.isStarred
                ? 'Removed from favorites'
                : 'Added to favorites'
            );
          } else {
            toast.error('Failed to update favorite status');
          }
        }}
        onExportSession={async (session: CheckSession) => {
          const success = await sessionManager.exportSession(session);
          if (success) {
            toast.success('Session exported successfully');
          } else {
            toast.error('Failed to export session');
          }
        }}
        onDeleteSession={async (sessionId: string) => {
          const success = await sessionManager.deleteSession(sessionId);
          if (success) {
            toast.success('Session deleted successfully');
          } else {
            toast.error('Failed to delete session');
          }
        }}
        onClearHistory={async () => {
          const confirmed = window.confirm(
            'Are you sure you want to clear all history? This action cannot be undone.'
          );
          if (confirmed) {
            const success = await sessionManager.clearAllSessions();
            if (success) {
              toast.success('All history cleared');
            } else {
              toast.error('Failed to clear history');
            }
          }
        }}
      />

      <WhatsAppDetailsModal
        result={state.selectedResult}
        isOpen={state.isDetailsModalOpen}
        onClose={() => {
          actions.setIsDetailsModalOpen(false);
          actions.setSelectedResult(null);
        }}
      />

      <LoadingOverlay isVisible={state.isLoading} />

      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </div>
  );
};

export default App;
