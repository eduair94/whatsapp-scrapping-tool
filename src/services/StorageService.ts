import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { AppSettings, CheckSession } from '../types';

export class StorageService {
  private userDataPath: string;
  private settingsPath: string;
  private sessionsPath: string;

  constructor() {
    this.userDataPath = app.getPath('userData');
    this.settingsPath = path.join(this.userDataPath, 'settings.json');
    this.sessionsPath = path.join(this.userDataPath, 'sessions');

    // Ensure directories exist
    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    if (!fs.existsSync(this.userDataPath)) {
      fs.mkdirSync(this.userDataPath, { recursive: true });
    }

    if (!fs.existsSync(this.sessionsPath)) {
      fs.mkdirSync(this.sessionsPath, { recursive: true });
    }
  }

  public async getSettings(): Promise<AppSettings> {
    try {
      if (fs.existsSync(this.settingsPath)) {
        const data = await fs.promises.readFile(this.settingsPath, 'utf8');
        const settings = JSON.parse(data);
        return { ...this.getDefaultSettings(), ...settings };
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }

    return this.getDefaultSettings();
  }

  public async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await fs.promises.writeFile(
        this.settingsPath,
        JSON.stringify(settings, null, 2),
        'utf8'
      );
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw new Error('Failed to save settings');
    }
  }

  public async saveSession(session: CheckSession): Promise<void> {
    try {
      const sessionPath = path.join(this.sessionsPath, `${session.id}.json`);
      const sessionData = {
        ...session,
        startTime: session.startTime.toISOString(),
        endTime: session.endTime?.toISOString(),
        results: session.results.map((result) => ({
          ...result,
          checkedAt: new Date().toISOString(),
        })),
      };

      await fs.promises.writeFile(
        sessionPath,
        JSON.stringify(sessionData, null, 2),
        'utf8'
      );
    } catch (error) {
      console.error('Failed to save session:', error);
      throw new Error('Failed to save session');
    }
  }

  public async getSession(sessionId: string): Promise<CheckSession | null> {
    try {
      const sessionPath = path.join(this.sessionsPath, `${sessionId}.json`);

      if (!fs.existsSync(sessionPath)) {
        return null;
      }

      const data = await fs.promises.readFile(sessionPath, 'utf8');
      const sessionData = JSON.parse(data);

      // Convert date strings back to Date objects
      return {
        ...sessionData,
        startTime: new Date(sessionData.startTime),
        endTime: sessionData.endTime
          ? new Date(sessionData.endTime)
          : undefined,
        results: sessionData.results.map((result: any) => ({
          ...result,
          checkedAt: new Date(result.checkedAt),
        })),
      };
    } catch (error) {
      console.error('Failed to load session:', error);
      return null;
    }
  }

  public async getSessions(): Promise<CheckSession[]> {
    try {
      const files = await fs.promises.readdir(this.sessionsPath);
      const sessions: CheckSession[] = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const sessionId = path.basename(file, '.json');
          const session = await this.getSession(sessionId);
          if (session) {
            sessions.push(session);
          }
        }
      }

      // Sort by start time (newest first)
      return sessions.sort(
        (a, b) => b.startTime.getTime() - a.startTime.getTime()
      );
    } catch (error) {
      console.error('Failed to load sessions:', error);
      return [];
    }
  }

  public async deleteSession(sessionId: string): Promise<boolean> {
    try {
      const sessionPath = path.join(this.sessionsPath, `${sessionId}.json`);

      if (fs.existsSync(sessionPath)) {
        await fs.promises.unlink(sessionPath);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to delete session:', error);
      return false;
    }
  }

  public async clearAllSessions(): Promise<void> {
    try {
      const files = await fs.promises.readdir(this.sessionsPath);

      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.sessionsPath, file);
          await fs.promises.unlink(filePath);
        }
      }
    } catch (error) {
      console.error('Failed to clear sessions:', error);
      throw new Error('Failed to clear sessions');
    }
  }

  public getStoragePaths(): {
    userDataPath: string;
    settingsPath: string;
    sessionsPath: string;
  } {
    return {
      userDataPath: this.userDataPath,
      settingsPath: this.settingsPath,
      sessionsPath: this.sessionsPath,
    };
  }

  private getDefaultSettings(): AppSettings {
    return {
      apiKey: '',
      maxRetries: 3,
      retryDelay: 1000,
      timeout: 15000,
      throwOnLimit: false,
      concurrentRequests: 1,
      saveResults: true,
      autoExport: false,
      defaultExportFormat: 'json' as const,
      theme: 'light' as const,
    };
  }

  public async getSessionStats(): Promise<{
    totalSessions: number;
    totalNumbersChecked: number;
    totalSuccessful: number;
    totalFailed: number;
    lastCheckDate?: Date;
  }> {
    const sessions = await this.getSessions();

    const stats = {
      totalSessions: sessions.length,
      totalNumbersChecked: 0,
      totalSuccessful: 0,
      totalFailed: 0,
      lastCheckDate: undefined as Date | undefined,
    };

    for (const session of sessions) {
      stats.totalNumbersChecked += session.totalNumbers;
      stats.totalSuccessful += session.successfulChecks;
      stats.totalFailed += session.failedChecks;

      if (!stats.lastCheckDate || session.startTime > stats.lastCheckDate) {
        stats.lastCheckDate = session.startTime;
      }
    }

    return stats;
  }
}
