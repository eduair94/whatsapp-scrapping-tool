import React from 'react';
import { PhoneNumberData } from '../types';

interface PreviewSectionProps {
  numbers: PhoneNumberData[];
  onStartCheck: () => void;
  onCleanNumbers: () => void;
  onGoHome: () => void;
  onAddMoreNumbers: () => void;
}

export const PreviewSection: React.FC<PreviewSectionProps> = ({
  numbers,
  onStartCheck,
  onCleanNumbers,
  onGoHome,
  onAddMoreNumbers,
}) => {
  const validNumbers = numbers.filter((n) => n.isValid);
  const invalidNumbers = numbers.filter((n) => !n.isValid);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Numbers</p>
              <p className="text-2xl font-bold text-gray-900">
                {numbers.length.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Valid Numbers</p>
              <p className="text-2xl font-bold text-green-600">
                {validNumbers.length.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-600"
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
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Invalid Numbers
              </p>
              <p className="text-2xl font-bold text-red-600">
                {invalidNumbers.length.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button
            onClick={onGoHome}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Go Home
          </button>

          <button
            onClick={onAddMoreNumbers}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Add More Numbers
          </button>
        </div>

        {/* Primary Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onStartCheck}
            disabled={validNumbers.length === 0}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors inline-flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            Start WhatsApp Check ({validNumbers.length.toLocaleString()}{' '}
            numbers)
          </button>

          {invalidNumbers.length > 0 && (
            <button
              onClick={onCleanNumbers}
              className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-6 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Clean Invalid ({invalidNumbers.length.toLocaleString()})
            </button>
          )}
        </div>
      </div>

      {/* Numbers Preview */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Phone Numbers Preview
          </h3>
          {numbers.length > 100 && (
            <span className="text-sm text-gray-500">
              Showing first 100 of {numbers.length.toLocaleString()} numbers
            </span>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          <div className="space-y-2">
            {numbers.slice(0, 100).map((number, index) => (
              <div
                key={`${number.original}-${index}`}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  number.isValid
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      number.isValid ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  ></div>
                  <span className="font-mono text-sm">{number.original}</span>
                  {number.cleaned !== number.original && (
                    <span className="text-xs text-gray-500">
                      → {number.cleaned}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      number.isValid
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {number.isValid ? 'Valid' : 'Invalid'}
                  </span>
                  {number.country && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {number.country}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {numbers.length > 100 && (
              <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
                <p className="font-medium">
                  + {(numbers.length - 100).toLocaleString()} more numbers
                </p>
                <p className="text-xs mt-1">
                  All numbers will be processed during the check
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
