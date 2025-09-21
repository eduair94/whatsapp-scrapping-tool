import { useCallback, useEffect, useState } from 'react';
import { CheckSession } from '../types';
import { useElectronAPI } from './useElectronAPI';
import { categorizeResults } from '../utils/resultUtils';

interface SessionManagerState {
  sessions: CheckSession[];
  currentSession: CheckSession | null;
  isLoading: boolean;
  canResume: boolean;
  canPause: boolean;
}

export const useSessionManager = () => {
  const [state, setState] = useState<SessionManagerState>({
    sessions: [],
    currentSession: null,
    isLoading: false,
    canResume: false,
    canPause: false,
  });

  const electronAPI = useElectronAPI();

  const loadSessions = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));
      const savedHistory = await electronAPI.getSessions();
      setState((prev) => ({
        ...prev,
        sessions: savedHistory || [],
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to load sessions:', error);
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [electronAPI]);

  const selectSession = useCallback((session: CheckSession) => {
    setState((prev) => ({
      ...prev,
      currentSession: session,
      canResume: 
        session.status === 'pending' ||
        session.status === 'running' || 
        session.status === 'cancelled',
      canPause: session.status === 'running',
    }));
  }, []);

  const pauseSession = useCallback(async () => {
    if (!state.currentSession || state.currentSession.status !== 'running') {
      return;
    }

    try {
      await electronAPI.cancelCheck();
      
      // Update session status and timestamps
      const updates = {
        status: 'cancelled' as const,
        pausedAt: new Date(),
      };
      
      const updatedSession = { ...state.currentSession, ...updates };
      await electronAPI.saveSession(updatedSession);
      
      setState((prev) => ({
        ...prev,
        currentSession: updatedSession,
        canPause: false,
        canResume: true,
      }));
    } catch (error) {
      console.error('Failed to pause session:', error);
    }
  }, [state.currentSession, electronAPI]);

  const resumeSession = useCallback(async () => {
    if (!state.currentSession || !state.canResume) {
      return;
    }

    try {
      let numbersToCheck: { original: string; cleaned: string; isValid: boolean }[] = [];

      // For pending sessions that haven't started, use originalNumbers
      if (state.currentSession.status === 'pending' && state.currentSession.originalNumbers) {
        numbersToCheck = state.currentSession.originalNumbers.map((num) => ({
          original: num.original,
          cleaned: num.cleaned,
          isValid: num.isValid,
        }));
      } else {
        // For sessions that were started but paused, use categorization to get only pending numbers
        const categorization = categorizeResults(state.currentSession.results);
        numbersToCheck = categorization.pendingResults.map((result) => ({
          original: result.number,
          cleaned: result.number,
          isValid: true,
        }));
      }

      if (numbersToCheck.length > 0) {
        // Update session status and timestamps
        const updates = {
          status: 'running' as const,
          lastResumedAt: new Date(),
        };
        
        const updatedSession = { ...state.currentSession, ...updates };
        await electronAPI.saveSession(updatedSession);
        
        await electronAPI.startBulkCheck(
          numbersToCheck,
          state.currentSession.settings,
          state.currentSession.id
        );
        
        setState((prev) => ({
          ...prev,
          currentSession: updatedSession,
          canResume: false,
          canPause: true,
        }));
      }
    } catch (error) {
      console.error('Failed to resume session:', error);
    }
  }, [state.currentSession, state.canResume, electronAPI]);

  const addSession = useCallback((session: CheckSession) => {
    setState((prev) => ({
      ...prev,
      sessions: [session, ...prev.sessions.slice(0, 49)], // Keep last 50 sessions
    }));
  }, []);

  const updateCurrentSession = useCallback((updates: Partial<CheckSession>) => {
    setState((prev) => ({
      ...prev,
      currentSession: prev.currentSession
        ? { ...prev.currentSession, ...updates }
        : null,
    }));
  }, []);

  const updateSessionById = useCallback(
    (sessionId: string, updates: Partial<CheckSession>) => {
      setState((prev) => ({
        ...prev,
        sessions: prev.sessions.map((session) =>
          session.id === sessionId ? { ...session, ...updates } : session
        ),
        currentSession:
          prev.currentSession?.id === sessionId
            ? { ...prev.currentSession, ...updates }
            : prev.currentSession,
      }));
    },
    []
  );

  const deleteSession = useCallback(
    async (sessionId: string) => {
      try {
        const success = await electronAPI.deleteSession(sessionId);
        if (success) {
          setState((prev) => ({
            ...prev,
            sessions: prev.sessions.filter((s) => s.id !== sessionId),
          }));
          return true;
        }
        return false;
      } catch (error) {
        console.error('Failed to delete session:', error);
        return false;
      }
    },
    [electronAPI]
  );

  const clearAllSessions = useCallback(async () => {
    try {
      // Delete all sessions from storage
      const deletePromises = state.sessions.map((session) =>
        electronAPI.deleteSession(session.id)
      );
      await Promise.all(deletePromises);

      setState((prev) => ({
        ...prev,
        sessions: [],
        currentSession: null,
      }));
      return true;
    } catch (error) {
      console.error('Failed to clear sessions:', error);
      return false;
    }
  }, [electronAPI, state.sessions]);

  const toggleStarSession = useCallback(
    async (session: CheckSession) => {
      try {
        const updatedSession = { ...session, isStarred: !session.isStarred };
        await electronAPI.saveSession(updatedSession);
        updateSessionById(session.id, { isStarred: !session.isStarred });
        return true;
      } catch (error) {
        console.error('Failed to toggle star status:', error);
        return false;
      }
    },
    [electronAPI, updateSessionById]
  );

  const exportSession = useCallback(
    async (session: CheckSession) => {
      try {
        const result = await electronAPI.exportResults(session.id, {
          format: 'xlsx',
          includeDetails: true,
        });
        return result.success;
      } catch (error) {
        console.error('Failed to export session:', error);
        return false;
      }
    },
    [electronAPI]
  );

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return {
    ...state,
    loadSessions,
    selectSession,
    pauseSession,
    resumeSession,
    addSession,
    updateCurrentSession,
    updateSessionById,
    deleteSession,
    clearAllSessions,
    toggleStarSession,
    exportSession,
  };
};
