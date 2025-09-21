import {
  ClipboardDocumentIcon,
  DocumentArrowUpIcon,
} from '@heroicons/react/24/outline';
import React, { useRef, useState } from 'react';
import { PhoneNumberData } from '../types';
import { RandomNumberGenerator } from './RandomNumberGenerator';

interface WelcomeSectionProps {
  onFileUpload: (addMode?: boolean) => void;
  onTextSubmit: (text: string) => void;
  onRandomNumbers?: (numbers: PhoneNumberData[]) => void;
  isAddingMode?: boolean;
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({
  onFileUpload,
  onTextSubmit,
  onRandomNumbers,
  isAddingMode = false,
}) => {
  const [textInput, setTextInput] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    // For now, we'll just trigger the file upload dialog
    // In the original implementation, this would handle dropped files
    onFileUpload();
  };

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      onTextSubmit(textInput);
    }
  };

  const handlePaste = () => {
    navigator.clipboard.readText().then((text) => {
      setTextInput(text);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center mb-6">
          <svg
            className="h-8 w-8 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.486" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {isAddingMode ? 'Add More Numbers' : 'WhatsApp Number Checker'}
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          {isAddingMode
            ? 'Add more phone numbers to your current batch for checking.'
            : 'Verify phone numbers on WhatsApp quickly and efficiently. Upload a file or paste numbers to get started.'}
        </p>
      </div>

      {/* Upload Options */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* File Upload */}
        <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-dashed border-gray-200 hover:border-green-400 transition-colors">
          <div
            className={`relative ${dragActive ? 'bg-green-50 border-green-400' : ''}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="text-center">
              <DocumentArrowUpIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Upload File
              </h3>
              <p className="text-gray-600 mb-6">
                Drag and drop your file here, or click to browse
              </p>
              <button
                onClick={() => onFileUpload(isAddingMode)}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <DocumentArrowUpIcon className="h-5 w-5" />
                Choose File
              </button>
              <p className="text-sm text-gray-500 mt-4">
                Supports: CSV, TXT, Excel files
              </p>
            </div>
          </div>
        </div>

        {/* Text Input */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <ClipboardDocumentIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Paste Numbers
            </h3>
            <p className="text-gray-600">
              Enter or paste phone numbers directly
            </p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter phone numbers here... (one per line or separated by commas)"
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
              <button
                onClick={handlePaste}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-1"
                title="Paste from clipboard"
              >
                <ClipboardDocumentIcon className="h-5 w-5" />
              </button>
            </div>

            <button
              onClick={handleTextSubmit}
              disabled={!textInput.trim()}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Process Numbers
            </button>
          </div>
        </div>

        {/* Random Number Generator */}
        {onRandomNumbers && (
          <RandomNumberGenerator onNumbersGenerated={onRandomNumbers} />
        )}
      </div>

      {/* Features */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">
          Features
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
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
            <h4 className="font-medium text-gray-900 mb-2">Bulk Checking</h4>
            <p className="text-sm text-gray-600">
              Check thousands of numbers at once
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
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
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Fast Results</h4>
            <p className="text-sm text-gray-600">
              Get results quickly with our optimized API
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Export Results</h4>
            <p className="text-sm text-gray-600">
              Download results in multiple formats
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
