import React, { useEffect, useState } from 'react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  settings: AppSettings | null;
  onClose: () => void;
  onSave: (settings: Partial<AppSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Partial<AppSettings>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const newErrors: Record<string, string> = {};

    if (!formData.apiKey?.trim()) {
      newErrors.apiKey = 'API Key is required';
    }

    if (formData.maxRetries !== undefined && formData.maxRetries < 0) {
      newErrors.maxRetries = 'Max retries must be 0 or greater';
    }

    if (formData.retryDelay !== undefined && formData.retryDelay < 0) {
      newErrors.retryDelay = 'Retry delay must be 0 or greater';
    }

    if (formData.timeout !== undefined && formData.timeout < 1000) {
      newErrors.timeout = 'Timeout must be at least 1000ms';
    }

    if (
      formData.concurrentRequests !== undefined &&
      formData.concurrentRequests < 1
    ) {
      newErrors.concurrentRequests = 'Concurrent requests must be at least 1';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSave(formData);
    }
  };

  const handleInputChange = (field: keyof AppSettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Settings</h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* API Key */}
                <div>
                  <label
                    htmlFor="apiKey"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    API Key *
                  </label>
                  <input
                    type="password"
                    id="apiKey"
                    value={formData.apiKey || ''}
                    onChange={(e) =>
                      handleInputChange('apiKey', e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.apiKey ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your WhatsApp API key"
                  />
                  {errors.apiKey && (
                    <p className="mt-1 text-sm text-red-600">{errors.apiKey}</p>
                  )}
                </div>

                {/* Max Retries */}
                <div>
                  <label
                    htmlFor="maxRetries"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Max Retries
                  </label>
                  <input
                    type="number"
                    id="maxRetries"
                    min="0"
                    value={formData.maxRetries ?? 3}
                    onChange={(e) =>
                      handleInputChange('maxRetries', parseInt(e.target.value))
                    }
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.maxRetries ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.maxRetries && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.maxRetries}
                    </p>
                  )}
                </div>

                {/* Retry Delay */}
                <div>
                  <label
                    htmlFor="retryDelay"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Retry Delay (ms)
                  </label>
                  <input
                    type="number"
                    id="retryDelay"
                    min="0"
                    value={formData.retryDelay ?? 1000}
                    onChange={(e) =>
                      handleInputChange('retryDelay', parseInt(e.target.value))
                    }
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.retryDelay ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.retryDelay && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.retryDelay}
                    </p>
                  )}
                </div>

                {/* Timeout */}
                <div>
                  <label
                    htmlFor="timeout"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Request Timeout (ms)
                  </label>
                  <input
                    type="number"
                    id="timeout"
                    min="1000"
                    value={formData.timeout ?? 10000}
                    onChange={(e) =>
                      handleInputChange('timeout', parseInt(e.target.value))
                    }
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.timeout ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.timeout && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.timeout}
                    </p>
                  )}
                </div>

                {/* Concurrent Requests */}
                <div>
                  <label
                    htmlFor="concurrentRequests"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Concurrent Requests
                  </label>
                  <input
                    type="number"
                    id="concurrentRequests"
                    min="1"
                    value={formData.concurrentRequests ?? 5}
                    onChange={(e) =>
                      handleInputChange(
                        'concurrentRequests',
                        parseInt(e.target.value)
                      )
                    }
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.concurrentRequests
                        ? 'border-red-300'
                        : 'border-gray-300'
                    }`}
                  />
                  {errors.concurrentRequests && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.concurrentRequests}
                    </p>
                  )}
                </div>

                {/* Checkboxes */}
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="throwOnLimit"
                      checked={formData.throwOnLimit ?? false}
                      onChange={(e) =>
                        handleInputChange('throwOnLimit', e.target.checked)
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="throwOnLimit"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Throw on rate limit
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="saveResults"
                      checked={formData.saveResults ?? true}
                      onChange={(e) =>
                        handleInputChange('saveResults', e.target.checked)
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="saveResults"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Save results automatically
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="autoExport"
                      checked={formData.autoExport ?? false}
                      onChange={(e) =>
                        handleInputChange('autoExport', e.target.checked)
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="autoExport"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Auto export results
                    </label>
                  </div>
                </div>

                {/* Export Format */}
                <div>
                  <label
                    htmlFor="defaultExportFormat"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Default Export Format
                  </label>
                  <select
                    id="defaultExportFormat"
                    value={formData.defaultExportFormat ?? 'json'}
                    onChange={(e) =>
                      handleInputChange(
                        'defaultExportFormat',
                        e.target.value as 'json' | 'csv' | 'xlsx'
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="json">JSON</option>
                    <option value="csv">CSV</option>
                    <option value="xlsx">Excel</option>
                  </select>
                </div>

                {/* Theme */}
                <div>
                  <label
                    htmlFor="theme"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Theme
                  </label>
                  <select
                    id="theme"
                    value={formData.theme ?? 'light'}
                    onChange={(e) =>
                      handleInputChange(
                        'theme',
                        e.target.value as 'light' | 'dark'
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Save Settings
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
