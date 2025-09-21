import toast from 'react-hot-toast';
import {
  AppSettings,
  BulkCheckProgress,
  CheckSession,
  PhoneNumberData,
} from '../types';

export interface SessionManagerHooks {
  addSession: (session: CheckSession) => void;
  updateSessionById: (id: string, session: CheckSession) => void;
  loadSessions: () => Promise<void>;
}

export interface ElectronAPISession {
  saveSession: (session: CheckSession) => Promise<void>;
}

export class SessionOperations {
  constructor(
    private sessionManager: SessionManagerHooks,
    private electronAPI: ElectronAPISession
  ) {}

  async createPendingSession(
    numbers: PhoneNumberData[],
    settings: AppSettings | null
  ): Promise<CheckSession | null> {
    if (!settings) {
      return null;
    }

    const validNumbers = numbers.filter((n) => n.isValid);
    if (validNumbers.length === 0) {
      return null;
    }

    try {
      const pendingSession: CheckSession = {
        id: `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        fileName: 'Pending Session',
        startTime: new Date(),
        totalNumbers: validNumbers.length,
        completedNumbers: 0,
        successfulChecks: 0,
        failedChecks: 0,
        notOnWhatsAppChecks: 0,
        apiErrorChecks: 0,
        rateLimitedChecks: 0,
        results: [],
        originalNumbers: validNumbers, // Store original numbers for resuming
        settings,
        status: 'pending',
      };

      // Add pending session to history immediately
      this.sessionManager.addSession(pendingSession);

      // Save pending session to backend
      await this.electronAPI.saveSession(pendingSession);

      // Reload sessions to ensure history is up to date
      await this.sessionManager.loadSessions();

      console.log('Created pending session:', pendingSession.id);
      return pendingSession;
    } catch (error) {
      console.error('Failed to create pending session:', error);
      return null;
    }
  }

  async createSessionForCheck(
    validNumbers: PhoneNumberData[],
    settings: AppSettings
  ): Promise<CheckSession> {
    const session: CheckSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fileName: 'Current Session',
      startTime: new Date(),
      totalNumbers: validNumbers.length,
      completedNumbers: 0,
      successfulChecks: 0,
      failedChecks: 0,
      notOnWhatsAppChecks: 0,
      apiErrorChecks: 0,
      rateLimitedChecks: 0,
      results: [],
      originalNumbers: validNumbers,
      settings,
      status: 'pending',
    };

    // Add pending session to history immediately
    this.sessionManager.addSession(session);

    // Save pending session to backend immediately
    await this.electronAPI.saveSession(session);

    // Reload sessions to ensure history is up to date
    await this.sessionManager.loadSessions();

    toast.success(`Created session with ${validNumbers.length} numbers`);
    return session;
  }

  updateSessionProgress(
    currentSession: CheckSession | null,
    progress: BulkCheckProgress
  ): CheckSession | null {
    if (currentSession && currentSession.status === 'pending') {
      const updatedSession = {
        ...currentSession,
        status: 'running' as const,
        completedNumbers: progress.completed,
        successfulChecks: progress.successful,
        failedChecks: progress.failed,
      };
      this.sessionManager.updateSessionById(currentSession.id, updatedSession);
      return updatedSession;
    }
    return currentSession;
  }

  updateSession(session: CheckSession): void {
    this.sessionManager.updateSessionById(session.id, session);
  }

  completeSession(
    currentSession: CheckSession | null,
    completedSession: CheckSession
  ): CheckSession {
    if (
      currentSession &&
      (currentSession.status === 'pending' ||
        currentSession.status === 'running')
    ) {
      const updatedSession = {
        ...currentSession,
        ...completedSession,
        id: currentSession.id, // Keep the original session ID
        status: 'completed' as const,
        endTime: new Date(),
      };
      this.sessionManager.updateSessionById(currentSession.id, updatedSession);
      return updatedSession;
    } else {
      // Fallback: if no current session, just mark the completed session as completed
      // and update it in the session list (don't add a new one)
      const finalSession = {
        ...completedSession,
        status: 'completed' as const,
        endTime: new Date(),
      };
      this.sessionManager.updateSessionById(completedSession.id, finalSession);
      return finalSession;
    }
  }

  cancelSession(currentSession: CheckSession | null): CheckSession | null {
    if (
      currentSession &&
      (currentSession.status === 'pending' ||
        currentSession.status === 'running')
    ) {
      const updatedSession = {
        ...currentSession,
        status: 'cancelled' as const,
        endTime: new Date(),
      };
      this.sessionManager.updateSessionById(currentSession.id, updatedSession);
      return updatedSession;
    }
    return currentSession;
  }
}
