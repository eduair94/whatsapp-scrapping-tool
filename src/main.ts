import { app, BrowserWindow, dialog, ipcMain, Menu } from 'electron';
import * as path from 'path';
import { FileService } from './services/FileService';
import { StorageService } from './services/StorageService';
import { WhatsAppService } from './services/WhatsAppService';
import {
  AppSettings,
  BulkCheckProgress,
  CheckSession,
  ExportOptions,
  PhoneNumberData,
  RateLimitInfo,
  WhatsAppCheckResult,
} from './types';

class WhatsAppCheckerApp {
  private mainWindow: BrowserWindow | null = null;
  private whatsAppService: WhatsAppService | null = null;
  private fileService: FileService;
  private storageService: StorageService;
  private currentSession: CheckSession | null = null;
  private checkCancelled: boolean = false;

  constructor() {
    this.fileService = new FileService();
    this.storageService = new StorageService();
    this.setupEventHandlers();
  }

  public async createMainWindow(): Promise<void> {
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      x: 100, // Explicit position
      y: 100, // Explicit position
      show: true, // Show immediately
      center: true, // Center the window
      resizable: true,
      alwaysOnTop: true, // Temporarily force on top
      // icon: path.join(__dirname, '../assets/icon.png'), // Disabled for now
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
        webSecurity: true,
        allowRunningInsecureContent: false,
      },
      titleBarStyle: 'default',
      autoHideMenuBar: false,
    });

    // Create application menu
    this.createMenu();

    // Load the React HTML file
    await this.mainWindow.loadFile(
      path.join(__dirname, '../dist/renderer/index.html')
    );

    // Show window when ready
    this.mainWindow.once('ready-to-show', () => {
      console.log('Window ready to show!');
      this.mainWindow?.show();
      this.mainWindow?.focus();

      // Open DevTools in development
      if (process.env.NODE_ENV === 'development') {
        this.mainWindow?.webContents.openDevTools();
      }
    });

    // Handle window closed
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  }

  private createMenu(): void {
    const template: Electron.MenuItemConstructorOptions[] = [
      {
        label: 'File',
        submenu: [
          {
            label: 'Upload File',
            accelerator: 'CmdOrCtrl+O',
            click: () => this.handleFileUpload(),
          },
          {
            label: 'Export Results',
            accelerator: 'CmdOrCtrl+E',
            click: () => this.handleExportDialog(),
          },
          { type: 'separator' },
          {
            label: 'Quit',
            accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
            click: () => app.quit(),
          },
        ],
      },
      {
        label: 'Edit',
        submenu: [
          { role: 'undo' },
          { role: 'redo' },
          { type: 'separator' },
          { role: 'cut' },
          { role: 'copy' },
          { role: 'paste' },
          { role: 'selectAll' },
        ],
      },
      {
        label: 'View',
        submenu: [
          { role: 'reload' },
          { role: 'forceReload' },
          { role: 'toggleDevTools' },
          { type: 'separator' },
          { role: 'resetZoom' },
          { role: 'zoomIn' },
          { role: 'zoomOut' },
          { type: 'separator' },
          { role: 'togglefullscreen' },
        ],
      },
      {
        label: 'Window',
        submenu: [{ role: 'minimize' }, { role: 'close' }],
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'About',
            click: () => this.showAboutDialog(),
          },
        ],
      },
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  private setupEventHandlers(): void {
    // Handle file upload
    ipcMain.handle('upload-file', async () => {
      return await this.handleFileUpload();
    });

    // Handle text input processing
    ipcMain.handle('process-text-input', async (_, textInput: string) => {
      return await this.handleTextInput(textInput);
    });

    // Handle bulk check start
    ipcMain.handle(
      'start-bulk-check',
      async (
        _,
        phoneNumbers: PhoneNumberData[],
        settings: AppSettings,
        sessionId?: string
      ) => {
        return await this.startBulkCheck(phoneNumbers, settings, sessionId);
      }
    );

    // Handle check cancellation
    ipcMain.handle('cancel-check', async () => {
      this.cancelCheck();
    });

    // Handle settings update
    ipcMain.handle(
      'update-settings',
      async (_, settings: Partial<AppSettings>) => {
        return await this.updateSettings(settings);
      }
    );

    // Handle get settings
    ipcMain.handle('get-settings', async () => {
      return await this.storageService.getSettings();
    });

    // Handle export results
    ipcMain.handle(
      'export-results',
      async (_, sessionId: string, options: ExportOptions) => {
        return await this.exportResults(sessionId, options);
      }
    );

    // Handle get sessions
    ipcMain.handle('get-sessions', async () => {
      return await this.storageService.getSessions();
    });

    // Handle save session
    ipcMain.handle('save-session', async (_, session: CheckSession) => {
      return await this.storageService.saveSession(session);
    });

    // Handle generate random numbers
    ipcMain.handle(
      'generate-random-numbers',
      async (_, country: string, quantity: number) => {
        return await this.handleGenerateRandomNumbers(country, quantity);
      }
    );

    // Handle delete session
    ipcMain.handle('delete-session', async (_, sessionId: string) => {
      return await this.storageService.deleteSession(sessionId);
    });
  }

  private async handleFileUpload(): Promise<any> {
    if (!this.mainWindow) return null;

    const result = await dialog.showOpenDialog(this.mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'Spreadsheet Files', extensions: ['csv', 'xlsx', 'xls'] },
        { name: 'Text Files', extensions: ['txt'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    try {
      const filePath = result.filePaths[0];
      const uploadResult = await this.fileService.parseFile(filePath);

      // Send result to renderer
      this.mainWindow.webContents.send('file-uploaded', uploadResult);

      return uploadResult;
    } catch (error) {
      console.error('File upload error:', error);
      return {
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private async handleTextInput(textInput: string): Promise<any> {
    try {
      if (!textInput || textInput.trim().length === 0) {
        return { error: 'No phone numbers provided' };
      }

      const uploadResult = await this.fileService.parseTextInput(textInput);

      // Don't send file-uploaded event for text input - return result directly
      return uploadResult;
    } catch (error) {
      console.error('Text input processing error:', error);
      return {
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private async handleGenerateRandomNumbers(
    country: string,
    quantity: number
  ): Promise<{ error?: string; numbers?: PhoneNumberData[] }> {
    try {
      if (!country || !quantity || quantity <= 0) {
        return { error: 'Invalid country or quantity specified' };
      }

      if (quantity > 1000) {
        return { error: 'Maximum quantity allowed is 1000 numbers' };
      }

      const numbers = this.fileService.generateRandomPhoneNumbers(
        country,
        quantity
      );

      if (numbers.length === 0) {
        return { error: 'Failed to generate valid phone numbers' };
      }

      return { numbers };
    } catch (error) {
      console.error('Random number generation error:', error);
      return {
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private async startBulkCheck(
    phoneNumbers: PhoneNumberData[],
    settings: AppSettings,
    sessionId?: string
  ): Promise<boolean> {
    try {
      if (!settings.apiKey) {
        throw new Error('API key is required');
      }

      // Initialize WhatsApp service with settings
      this.whatsAppService = new WhatsAppService(settings);
      this.checkCancelled = false;

      // Create new session or update existing pending session
      this.currentSession = {
        id: sessionId || Date.now().toString(),
        fileName: `bulk-check-${new Date().toISOString().split('T')[0]}`,
        startTime: new Date(),
        totalNumbers: phoneNumbers.length,
        completedNumbers: 0,
        successfulChecks: 0,
        failedChecks: 0,
        results: [],
        settings,
        status: 'running',
      };

      // Save session
      await this.storageService.saveSession(this.currentSession);

      // Start bulk checking with progress updates
      const onProgress = (progress: BulkCheckProgress) => {
        if (this.mainWindow) {
          this.mainWindow.webContents.send('check-progress', progress);
        }
      };

      const onRateLimit = (rateLimitInfo: RateLimitInfo) => {
        console.log('RateLimitInfo', rateLimitInfo);
        if (this.mainWindow) {
          this.mainWindow.webContents.send('rate-limit-update', rateLimitInfo);
        }
      };

      await this.whatsAppService.checkBulk(phoneNumbers, {
        onProgress,
        onRateLimit,
        onComplete: async (results: WhatsAppCheckResult[]) => {
          if (this.currentSession) {
            this.currentSession.results = results;
            this.currentSession.endTime = new Date();
            this.currentSession.status = this.checkCancelled
              ? 'cancelled'
              : 'completed';
            this.currentSession.completedNumbers = results.length;
            this.currentSession.successfulChecks = results.filter(
              (r: WhatsAppCheckResult) => !r.error
            ).length;
            this.currentSession.failedChecks = results.filter(
              (r: WhatsAppCheckResult) => r.error
            ).length;

            await this.storageService.saveSession(this.currentSession);

            if (this.mainWindow) {
              this.mainWindow.webContents.send(
                'check-completed',
                this.currentSession
              );
            }
          }
        },
        stopOnError: false,
        maxRetries: settings.maxRetries,
      });

      return true;
    } catch (error) {
      console.error('Bulk check error:', error);

      if (this.currentSession) {
        this.currentSession.status = 'error';
        this.currentSession.endTime = new Date();
        await this.storageService.saveSession(this.currentSession);
      }

      throw error;
    }
  }

  private cancelCheck(): void {
    this.checkCancelled = true;
    if (this.whatsAppService) {
      this.whatsAppService.cancelCheck();
    }
  }

  private async updateSettings(
    newSettings: Partial<AppSettings>
  ): Promise<AppSettings> {
    const currentSettings = await this.storageService.getSettings();
    const updatedSettings = { ...currentSettings, ...newSettings };
    await this.storageService.saveSettings(updatedSettings);

    if (this.mainWindow) {
      this.mainWindow.webContents.send('settings-updated', updatedSettings);
    }

    return updatedSettings;
  }

  private async exportResults(
    sessionId: string,
    options: ExportOptions
  ): Promise<{ success: boolean; filePath?: string; error?: string }> {
    try {
      const session = await this.storageService.getSession(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      if (!this.mainWindow) {
        throw new Error('Main window not available');
      }

      // Create format-specific filters
      const getFiltersForFormat = (format: string) => {
        switch (format) {
          case 'csv':
            return [{ name: 'CSV Files', extensions: ['csv'] }];
          case 'xlsx':
            return [{ name: 'Excel Files', extensions: ['xlsx'] }];
          case 'json':
          default:
            return [{ name: 'JSON Files', extensions: ['json'] }];
        }
      };

      // Show save dialog
      const result = await dialog.showSaveDialog(this.mainWindow, {
        defaultPath:
          options.fileName || `whatsapp-results-${sessionId}.${options.format}`,
        filters: getFiltersForFormat(options.format),
      });

      if (result.canceled || !result.filePath) {
        return { success: false, error: 'Export cancelled' };
      }

      // Ensure the file path has the correct extension
      let finalFilePath = result.filePath;
      const expectedExtension = `.${options.format}`;
      if (
        !finalFilePath.toLowerCase().endsWith(expectedExtension.toLowerCase())
      ) {
        finalFilePath += expectedExtension;
      }

      const filePath = await this.fileService.exportResults(
        session,
        options,
        finalFilePath
      );

      return { success: true, filePath };
    } catch (error) {
      console.error('Export error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private handleExportDialog(): void {
    // This will be handled by the renderer process
    if (this.mainWindow) {
      this.mainWindow.webContents.send('show-export-dialog');
    }
  }

  private showAboutDialog(): void {
    if (this.mainWindow) {
      dialog.showMessageBox(this.mainWindow, {
        type: 'info',
        title: 'About WhatsApp Number Checker',
        message: 'WhatsApp Number Checker Tool',
        detail: `Version: ${app.getVersion()}\n\nA powerful desktop application for bulk WhatsApp number validation.\n\nBuilt with Electron and TypeScript.`,
        buttons: ['OK'],
      });
    }
  }

  public async initialize(): Promise<void> {
    // Wait for app to be ready
    await app.whenReady();

    // Create main window
    await this.createMainWindow();

    // Handle app activation (macOS)
    app.on('activate', async () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        await this.createMainWindow();
      }
    });

    // Handle all windows closed
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    // Handle app quit
    app.on('before-quit', () => {
      if (this.whatsAppService) {
        this.whatsAppService.cancelCheck();
      }
    });
  }
}

// Initialize and start the application
const whatsAppChecker = new WhatsAppCheckerApp();
whatsAppChecker.initialize().catch(console.error);

export default whatsAppChecker;
