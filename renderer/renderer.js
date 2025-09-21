// Renderer process script for WhatsApp Number Checker
class WhatsAppCheckerUI {
  constructor() {
    this.currentNumbers = [];
    this.currentSession = null;
    this.settings = {};
    this.initializeEventListeners();
    this.loadSettings();
  }

  initializeEventListeners() {
    // File upload events
    document
      .getElementById('uploadBtn')
      .addEventListener('click', () => this.handleFileUpload());
    document
      .getElementById('file-upload')
      .addEventListener('change', (e) => this.handleFileSelect(e));

    // Text input events
    document
      .getElementById('phoneTextArea')
      .addEventListener('input', (e) => this.updateTextAreaCount(e));
    document
      .getElementById('clearTextBtn')
      .addEventListener('click', () => this.clearTextArea());
    document
      .getElementById('processTextBtn')
      .addEventListener('click', () => this.processTextInput());

    // Drag and drop events
    const dropZone = document.getElementById('dropZone');
    dropZone.addEventListener('dragover', (e) => this.handleDragOver(e));
    dropZone.addEventListener('drop', (e) => this.handleDrop(e));
    dropZone.addEventListener('click', () =>
      document.getElementById('file-upload').click()
    );

    // Preview section events
    document
      .getElementById('cleanNumbersBtn')
      .addEventListener('click', () => this.cleanNumbers());
    document
      .getElementById('startCheckBtn')
      .addEventListener('click', () => this.startBulkCheck());

    // Checking section events
    document
      .getElementById('cancelCheckBtn')
      .addEventListener('click', () => this.cancelCheck());

    // Results section events
    document
      .getElementById('exportBtn')
      .addEventListener('click', () => this.showExportDialog());
    document
      .getElementById('newCheckBtn')
      .addEventListener('click', () => this.resetToWelcome());
    document
      .getElementById('filterResults')
      .addEventListener('change', (e) => this.filterResults(e.target.value));

    // Modal events
    document
      .getElementById('settingsBtn')
      .addEventListener('click', () => this.showSettingsModal());
    document
      .getElementById('historyBtn')
      .addEventListener('click', () => this.showHistoryModal());
    document
      .getElementById('closeSettingsModal')
      .addEventListener('click', () => this.hideSettingsModal());
    document
      .getElementById('closeHistoryModal')
      .addEventListener('click', () => this.hideHistoryModal());
    document
      .getElementById('cancelSettings')
      .addEventListener('click', () => this.hideSettingsModal());
    document
      .getElementById('settingsForm')
      .addEventListener('submit', (e) => this.saveSettings(e));

    // IPC event listeners
    window.electronAPI.onFileUploaded((result) =>
      this.handleFileUploaded(result)
    );
    window.electronAPI.onCheckProgress((progress) =>
      this.updateCheckProgress(progress)
    );
    window.electronAPI.onCheckCompleted((session) => this.showResults(session));
    window.electronAPI.onSettingsUpdated((settings) =>
      this.updateSettings(settings)
    );
    window.electronAPI.onShowExportDialog(() => this.showExportDialog());
  }

  async loadSettings() {
    try {
      this.settings = await window.electronAPI.getSettings();
      this.populateSettingsForm();
    } catch (error) {
      console.error('Failed to load settings:', error);
      this.showToast('Failed to load settings', 'error');
    }
  }

  populateSettingsForm() {
    const form = document.getElementById('settingsForm');
    if (this.settings.apiKey) {
      form.apiKey.value = this.settings.apiKey;
    }
    form.maxRetries.value = this.settings.maxRetries || 3;
    form.timeout.value = this.settings.timeout || 15000;
    form.throwOnLimit.checked = this.settings.throwOnLimit || false;
  }

  async handleFileUpload() {
    try {
      this.showLoading(true);
      await window.electronAPI.uploadFile();
    } catch (error) {
      console.error('File upload error:', error);
      this.showToast('Failed to upload file', 'error');
    } finally {
      this.showLoading(false);
    }
  }

  handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
      this.processSelectedFile(file);
    }
  }

  handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('border-whatsapp-400', 'bg-whatsapp-50');
  }

  handleDrop(event) {
    event.preventDefault();
    const dropZone = event.currentTarget;
    dropZone.classList.remove('border-whatsapp-400', 'bg-whatsapp-50');

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      this.processSelectedFile(files[0]);
    }
  }

  async processSelectedFile(file) {
    // Validate file type
    const allowedTypes = ['.csv', '.xlsx', '.xls', '.txt'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

    if (!allowedTypes.includes(fileExtension)) {
      this.showToast(
        'Please select a valid file type (CSV, XLSX, XLS, or TXT)',
        'error'
      );
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      this.showToast('File size must be less than 10MB', 'error');
      return;
    }

    // Trigger file upload via IPC
    try {
      this.showLoading(true);
      await window.electronAPI.uploadFile();
    } catch (error) {
      console.error('File processing error:', error);
      this.showToast('Failed to process file', 'error');
    } finally {
      this.showLoading(false);
    }
  }

  handleFileUploaded(result) {
    if (result.error) {
      this.showToast(result.error, 'error');
      return;
    }

    this.currentNumbers = result.numbers || [];
    this.showPreviewSection();
    this.updatePreviewStats();
    this.populateNumbersTable();
    this.showToast(
      `Successfully loaded ${this.currentNumbers.length} phone numbers`,
      'success'
    );
  }

  // Text input handling methods
  updateTextAreaCount(event) {
    const text = event.target.value;
    const lines = text.split('\n').filter((line) => line.trim().length > 0);
    const phoneNumbers = lines.filter((line) =>
      this.looksLikePhoneNumber(line.trim())
    );

    document.getElementById('textAreaCount').textContent = phoneNumbers.length;

    // Enable/disable process button based on content
    const processBtn = document.getElementById('processTextBtn');
    processBtn.disabled = phoneNumbers.length === 0;
  }

  looksLikePhoneNumber(text) {
    // Basic phone number detection regex
    const phoneRegex = /^[\+]?[1-9][\d\s\-\(\)\.]{7,15}$/;
    return phoneRegex.test(text.replace(/\s+/g, ''));
  }

  clearTextArea() {
    document.getElementById('phoneTextArea').value = '';
    document.getElementById('textAreaCount').textContent = '0';
    document.getElementById('processTextBtn').disabled = true;
  }

  async processTextInput() {
    const textArea = document.getElementById('phoneTextArea');
    const textInput = textArea.value.trim();

    if (!textInput) {
      this.showToast('Please enter some phone numbers', 'error');
      return;
    }

    try {
      this.showLoading(true);
      const result = await window.electronAPI.processTextInput(textInput);

      if (result) {
        // Handle the result directly without showing duplicate toast
        if (result.error) {
          this.showToast(result.error, 'error');
          return;
        }

        this.currentNumbers = result.numbers || [];
        this.showPreviewSection();
        this.updatePreviewStats();
        this.populateNumbersTable();
        this.showToast(
          `Successfully processed ${this.currentNumbers.length} phone numbers from text input`,
          'success'
        );
      }
    } catch (error) {
      console.error('Text processing error:', error);
      this.showToast('Failed to process phone numbers', 'error');
    } finally {
      this.showLoading(false);
    }
  }

  showPreviewSection() {
    document.getElementById('welcomeSection').classList.add('hidden');
    document.getElementById('processingSection').classList.add('hidden');
    document.getElementById('checkingSection').classList.add('hidden');
    document.getElementById('resultsSection').classList.add('hidden');
    document.getElementById('previewSection').classList.remove('hidden');
  }

  updatePreviewStats() {
    const total = this.currentNumbers.length;
    const valid = this.currentNumbers.filter((n) => n.isValid).length;
    const invalid = total - valid;
    const duplicates = this.findDuplicates().length;

    document.getElementById('totalCount').textContent = total;
    document.getElementById('validCount').textContent = valid;
    document.getElementById('invalidCount').textContent = invalid;
    document.getElementById('duplicateCount').textContent = duplicates;
  }

  populateNumbersTable() {
    const tbody = document.getElementById('numbersTableBody');
    tbody.innerHTML = '';

    this.currentNumbers.slice(0, 100).forEach((number) => {
      const row = document.createElement('tr');
      row.className = 'hover:bg-gray-50';

      const statusBadge = number.isValid
        ? '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Valid</span>'
        : '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Invalid</span>';

      row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${number.original}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${number.cleaned || '-'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${number.country || '-'}</td>
                <td class="px-6 py-4 whitespace-nowrap">${statusBadge}</td>
            `;

      tbody.appendChild(row);
    });

    if (this.currentNumbers.length > 100) {
      const row = document.createElement('tr');
      row.innerHTML = `
                <td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">
                    ... and ${this.currentNumbers.length - 100} more numbers
                </td>
            `;
      tbody.appendChild(row);
    }
  }

  findDuplicates() {
    const seen = new Set();
    const duplicates = [];

    this.currentNumbers.forEach((number) => {
      if (number.cleaned && seen.has(number.cleaned)) {
        duplicates.push(number);
      } else if (number.cleaned) {
        seen.add(number.cleaned);
      }
    });

    return duplicates;
  }

  cleanNumbers() {
    // Remove duplicates and invalid numbers
    const validNumbers = this.currentNumbers.filter((n) => n.isValid);
    const uniqueNumbers = [];
    const seen = new Set();

    validNumbers.forEach((number) => {
      if (!seen.has(number.cleaned)) {
        seen.add(number.cleaned);
        uniqueNumbers.push(number);
      }
    });

    this.currentNumbers = uniqueNumbers;
    this.updatePreviewStats();
    this.populateNumbersTable();
    this.showToast(
      `Cleaned numbers. ${uniqueNumbers.length} unique valid numbers remaining`,
      'success'
    );
  }

  async startBulkCheck() {
    if (!this.settings.apiKey) {
      this.showToast(
        'Please configure your API key in settings first',
        'error'
      );
      this.showSettingsModal();
      return;
    }

    const validNumbers = this.currentNumbers.filter((n) => n.isValid);
    if (validNumbers.length === 0) {
      this.showToast('No valid numbers to check', 'error');
      return;
    }

    try {
      this.showCheckingSection();
      await window.electronAPI.startBulkCheck(validNumbers, this.settings);
    } catch (error) {
      console.error('Bulk check error:', error);
      this.showToast('Failed to start bulk check', 'error');
    }
  }

  showCheckingSection() {
    document.getElementById('welcomeSection').classList.add('hidden');
    document.getElementById('processingSection').classList.add('hidden');
    document.getElementById('previewSection').classList.add('hidden');
    document.getElementById('resultsSection').classList.add('hidden');
    document.getElementById('checkingSection').classList.remove('hidden');

    // Reset progress
    this.updateCheckProgress({
      completed: 0,
      total: this.currentNumbers.filter((n) => n.isValid).length,
      successful: 0,
      failed: 0,
      rateLimited: 0,
    });
  }

  updateCheckProgress(progress) {
    const percentage =
      progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;

    document.getElementById('checkProgress').style.width = `${percentage}%`;
    document.getElementById('progressText').textContent =
      `${progress.completed} / ${progress.total}`;
    document.getElementById('checkedCount').textContent = progress.completed;
    document.getElementById('whatsappCount').textContent = progress.successful;
    document.getElementById('noWhatsappCount').textContent = progress.failed;
    document.getElementById('rateLimitedCount').textContent =
      progress.rateLimited || 0;

    if (progress.currentNumber) {
      document.getElementById('currentStatus').textContent =
        `Checking ${progress.currentNumber}...`;
    }
  }

  async cancelCheck() {
    try {
      await window.electronAPI.cancelCheck();
      this.showToast('Check cancelled', 'info');
      this.showPreviewSection();
    } catch (error) {
      console.error('Cancel check error:', error);
      this.showToast('Failed to cancel check', 'error');
    }
  }

  showResults(session) {
    this.currentSession = session;
    this.showResultsSection();
    this.populateResultsStats(session);
    this.populateResultsTable(session.results);
    this.showToast('WhatsApp number check completed!', 'success');
  }

  showResultsSection() {
    document.getElementById('welcomeSection').classList.add('hidden');
    document.getElementById('processingSection').classList.add('hidden');
    document.getElementById('previewSection').classList.add('hidden');
    document.getElementById('checkingSection').classList.add('hidden');
    document.getElementById('resultsSection').classList.remove('hidden');
  }

  populateResultsStats(session) {
    const total = session.results.length;
    const whatsappCount = session.results.filter(
      (r) => r.data && r.data.isWAContact
    ).length;
    const noWhatsappCount = session.results.filter(
      (r) => r.data && !r.data.isWAContact
    ).length;
    const successRate =
      total > 0 ? Math.round((whatsappCount / total) * 100) : 0;

    document.getElementById('finalTotalCount').textContent = total;
    document.getElementById('finalWhatsappCount').textContent = whatsappCount;
    document.getElementById('finalNoWhatsappCount').textContent =
      noWhatsappCount;
    document.getElementById('successRate').textContent = `${successRate}%`;
  }

  populateResultsTable(results) {
    const tbody = document.getElementById('resultsTableBody');
    tbody.innerHTML = '';

    results.forEach((result) => {
      const row = document.createElement('tr');
      row.className = 'hover:bg-gray-50';

      const hasWhatsApp = result.data && result.data.isWAContact;
      const statusBadge = result.error
        ? '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Error</span>'
        : hasWhatsApp
          ? '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Has WhatsApp</span>'
          : '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">No WhatsApp</span>';

      const name = result.data && result.data.name ? result.data.name : '-';
      const isBusiness = result.data && result.data.isBusiness ? 'Yes' : 'No';
      const details = result.error
        ? result.error
        : result.data && result.data.about
          ? result.data.about.substring(0, 50) + '...'
          : '-';

      row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${result.number}</td>
                <td class="px-6 py-4 whitespace-nowrap">${statusBadge}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${isBusiness}</td>
                <td class="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">${details}</td>
            `;

      tbody.appendChild(row);
    });
  }

  filterResults(filter) {
    if (!this.currentSession) return;

    let filteredResults = this.currentSession.results;

    switch (filter) {
      case 'whatsapp':
        filteredResults = this.currentSession.results.filter(
          (r) => r.data && r.data.isWAContact
        );
        break;
      case 'no-whatsapp':
        filteredResults = this.currentSession.results.filter(
          (r) => r.data && !r.data.isWAContact
        );
        break;
      case 'errors':
        filteredResults = this.currentSession.results.filter((r) => r.error);
        break;
      default:
        filteredResults = this.currentSession.results;
    }

    this.populateResultsTable(filteredResults);
  }

  async showExportDialog() {
    if (!this.currentSession) {
      this.showToast('No results to export', 'error');
      return;
    }

    try {
      const options = {
        format: 'xlsx',
        fileName: `whatsapp-results-${Date.now()}.xlsx`,
        includeErrors: true,
        includeDetails: true,
      };

      const result = await window.electronAPI.exportResults(
        this.currentSession.id,
        options
      );

      if (result.success) {
        this.showToast(
          `Results exported successfully to ${result.filePath}`,
          'success'
        );
      } else {
        this.showToast(result.error || 'Export failed', 'error');
      }
    } catch (error) {
      console.error('Export error:', error);
      this.showToast('Failed to export results', 'error');
    }
  }

  resetToWelcome() {
    this.currentNumbers = [];
    this.currentSession = null;

    document.getElementById('welcomeSection').classList.remove('hidden');
    document.getElementById('processingSection').classList.add('hidden');
    document.getElementById('previewSection').classList.add('hidden');
    document.getElementById('checkingSection').classList.add('hidden');
    document.getElementById('resultsSection').classList.add('hidden');

    // Reset file input
    document.getElementById('file-upload').value = '';
  }

  showSettingsModal() {
    document.getElementById('settingsModal').classList.remove('hidden');
    this.populateSettingsForm();
  }

  hideSettingsModal() {
    document.getElementById('settingsModal').classList.add('hidden');
  }

  async saveSettings(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const settings = {
      apiKey: formData.get('apiKey'),
      maxRetries: parseInt(formData.get('maxRetries')),
      timeout: parseInt(formData.get('timeout')),
      throwOnLimit: formData.get('throwOnLimit') === 'on',
    };

    try {
      await window.electronAPI.updateSettings(settings);
      this.hideSettingsModal();
      this.showToast('Settings saved successfully', 'success');
    } catch (error) {
      console.error('Save settings error:', error);
      this.showToast('Failed to save settings', 'error');
    }
  }

  updateSettings(settings) {
    this.settings = settings;
  }

  async showHistoryModal() {
    document.getElementById('historyModal').classList.remove('hidden');

    try {
      const sessions = await window.electronAPI.getSessions();
      this.populateHistoryContent(sessions);
    } catch (error) {
      console.error('Load history error:', error);
      this.showToast('Failed to load history', 'error');
    }
  }

  hideHistoryModal() {
    document.getElementById('historyModal').classList.add('hidden');
  }

  populateHistoryContent(sessions) {
    const content = document.getElementById('historyContent');

    if (sessions.length === 0) {
      content.innerHTML =
        '<p class="text-center text-gray-500 py-8">No check history found</p>';
      return;
    }

    content.innerHTML = `
            <div class="space-y-4">
                ${sessions
                  .map(
                    (session) => `
                    <div class="border rounded-lg p-4 hover:bg-gray-50">
                        <div class="flex items-center justify-between mb-2">
                            <h4 class="font-medium text-gray-900">${session.fileName}</h4>
                            <span class="text-sm text-gray-500">${new Date(session.startTime).toLocaleDateString()}</span>
                        </div>
                        <div class="grid grid-cols-3 gap-4 text-sm">
                            <div>
                                <span class="text-gray-500">Total:</span> 
                                <span class="font-medium">${session.totalNumbers}</span>
                            </div>
                            <div>
                                <span class="text-gray-500">WhatsApp:</span> 
                                <span class="font-medium text-green-600">${session.successfulChecks}</span>
                            </div>
                            <div>
                                <span class="text-gray-500">Failed:</span> 
                                <span class="font-medium text-red-600">${session.failedChecks}</span>
                            </div>
                        </div>
                        <div class="mt-2 flex space-x-2">
                            <button onclick="ui.loadSession('${session.id}')" class="text-xs bg-whatsapp-600 text-white px-2 py-1 rounded hover:bg-whatsapp-700">
                                Load Results
                            </button>
                            <button onclick="ui.deleteSession('${session.id}')" class="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700">
                                Delete
                            </button>
                        </div>
                    </div>
                `
                  )
                  .join('')}
            </div>
        `;
  }

  async loadSession(sessionId) {
    try {
      const sessions = await window.electronAPI.getSessions();
      const session = sessions.find((s) => s.id === sessionId);

      if (session) {
        this.currentSession = session;
        this.showResults(session);
        this.hideHistoryModal();
      }
    } catch (error) {
      console.error('Load session error:', error);
      this.showToast('Failed to load session', 'error');
    }
  }

  async deleteSession(sessionId) {
    if (confirm('Are you sure you want to delete this session?')) {
      try {
        await window.electronAPI.deleteSession(sessionId);
        this.showHistoryModal(); // Refresh the modal
        this.showToast('Session deleted successfully', 'success');
      } catch (error) {
        console.error('Delete session error:', error);
        this.showToast('Failed to delete session', 'error');
      }
    }
  }

  showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (show) {
      overlay.classList.remove('hidden');
    } else {
      overlay.classList.add('hidden');
    }
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');

    const bgColor =
      {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500',
      }[type] || 'bg-blue-500';

    toast.className = `${bgColor} text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full`;
    toast.innerHTML = `
            <div class="flex items-center justify-between">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        `;

    container.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.classList.remove('translate-x-full');
    }, 100);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (toast.parentElement) {
        toast.classList.add('translate-x-full');
        setTimeout(() => {
          if (toast.parentElement) {
            toast.remove();
          }
        }, 300);
      }
    }, 5000);
  }
}

// Initialize the UI when the DOM is loaded
let ui;
document.addEventListener('DOMContentLoaded', () => {
  ui = new WhatsAppCheckerUI();
});
