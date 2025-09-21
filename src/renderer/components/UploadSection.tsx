import React, { useState } from 'react';
import { useElectronAPI } from '../hooks/useElectronAPI';
import { PhoneNumberData } from '../types';

interface UploadSectionProps {
  onNumbersLoaded: (numbers: PhoneNumberData[]) => void;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  onNumbersLoaded,
}) => {
  const [textInput, setTextInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const electronAPI = useElectronAPI();

  const handleFileUpload = async () => {
    setIsLoading(true);
    try {
      const result = await electronAPI.openFileDialog();
      if (result.error) {
        console.error('File upload error:', result.error);
      } else if (result.numbers) {
        onNumbersLoaded(result.numbers);
      }
    } catch (error) {
      console.error('File upload error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!textInput.trim()) return;

    setIsLoading(true);
    try {
      const result = await electronAPI.parseTextInput(textInput);
      if (result.error) {
        console.error('Text parsing error:', result.error);
      } else if (result.numbers) {
        onNumbersLoaded(result.numbers);
        setTextInput('');
      }
    } catch (error) {
      console.error('Text parsing error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Upload Phone Numbers
        </h2>
        <p className="text-lg text-gray-600">
          Upload a CSV file or paste phone numbers directly to get started
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* File Upload */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Upload CSV File
          </h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-gray-600 mb-4">
              Click to select a CSV file containing phone numbers
            </p>
            <button
              onClick={handleFileUpload}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Choose File'}
            </button>
          </div>
        </div>

        {/* Text Input */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Paste Numbers
          </h3>
          <div className="space-y-4">
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Paste phone numbers here, one per line...&#10;+1234567890&#10;+0987654321&#10;etc."
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            />
            <button
              onClick={handleTextSubmit}
              disabled={isLoading || !textInput.trim()}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Process Numbers'}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <svg
            className="h-5 w-5 text-blue-400 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-medium">Supported formats:</p>
            <ul className="mt-1 list-disc list-inside">
              <li>CSV files with phone numbers</li>
              <li>Plain text with one number per line</li>
              <li>Numbers with or without country codes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
