import React, { useState } from 'react';
import { CheckSession } from '../types';
import { categorizeResults } from '../utils/resultUtils';
import { SessionDetailsModal } from './SessionDetailsModal';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: CheckSession[];
  onResumeSession?: (session: CheckSession) => void;
  onPauseSession?: (session: CheckSession) => void;
  onDeleteSession?: (sessionId: string) => void;
  onClearHistory?: () => void;
  onToggleStar?: (session: CheckSession) => void;
  onExportSession?: (session: CheckSession) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  sessions,
  onResumeSession,
  onPauseSession,
  onDeleteSession,
  onClearHistory,
  onToggleStar,
  onExportSession,
}) => {
  const [selectedSession, setSelectedSession] = useState<CheckSession | null>(
    null
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  if (!isOpen) return null;

  const handleSessionClick = (session: CheckSession) => {
    setSelectedSession(session);
    setIsDetailsOpen(true);
  };

  const handleResumeSession = () => {
    if (selectedSession && onResumeSession) {
      onResumeSession(selectedSession);
    }
  };

  const handlePauseSession = () => {
    if (selectedSession && onPauseSession) {
      onPauseSession(selectedSession);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Check History ({sessions.length})
              </h3>
              <div className="flex items-center gap-2">
                {sessions.length > 0 && onClearHistory && (
                  <button
                    onClick={onClearHistory}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded-md transition-colors"
                  >
                    Clear All
                  </button>
                )}
                <button
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
            </div>

            {sessions.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No history yet
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Your check history will appear here after running some checks.
                </p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <button
                          onClick={() => handleSessionClick(session)}
                          className="flex-1 text-left"
                        >
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-medium text-gray-900">
                              {session.fileName}
                            </h4>
                            {session.isStarred && (
                              <svg
                                className="w-4 h-4 text-yellow-500 fill-current"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                            )}
                          </div>
                        </button>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              session.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : session.status === 'running'
                                  ? 'bg-blue-100 text-blue-800'
                                  : session.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : session.status === 'error'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {session.status}
                          </span>
                          {onDeleteSession && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteSession(session.id);
                              }}
                              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
                              title="Delete session"
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
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleSessionClick(session)}
                        className="w-full text-left"
                      >
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Total:</span>
                            <div className="font-medium">
                              {session.totalNumbers.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">Active:</span>
                            <div className="font-medium text-green-600">
                              {categorizeResults(
                                session.results
                              ).activeResults.length.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">
                              Not on WhatsApp:
                            </span>
                            <div className="font-medium text-gray-600">
                              {categorizeResults(
                                session.results
                              ).notOnWhatsAppResults.length.toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">Date:</span>
                            <div className="font-medium">
                              {new Date(session.startTime).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        <div className="mt-2 text-xs text-gray-500">
                          API Errors:{' '}
                          {categorizeResults(
                            session.results
                          ).apiErrorResults.length.toLocaleString()}
                        </div>

                        {session.endTime && (
                          <div className="mt-2 text-xs text-gray-500">
                            Duration:{' '}
                            {Math.round(
                              (new Date(session.endTime).getTime() -
                                new Date(session.startTime).getTime()) /
                                1000
                            )}
                            s
                          </div>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <SessionDetailsModal
        session={selectedSession}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedSession(null);
        }}
        onResume={handleResumeSession}
        onPause={handlePauseSession}
        onToggleStar={onToggleStar}
        onExport={onExportSession}
        canResume={
          selectedSession?.status === 'pending' ||
          selectedSession?.status === 'running' ||
          selectedSession?.status === 'cancelled'
        }
        canPause={selectedSession?.status === 'running'}
      />
    </div>
  );
};
