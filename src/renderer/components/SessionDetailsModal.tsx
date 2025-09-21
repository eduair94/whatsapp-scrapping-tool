import React, { useState } from 'react';
import { CheckSession } from '../types';

interface SessionDetailsModalProps {
  session: CheckSession | null;
  isOpen: boolean;
  onClose: () => void;
  onResume?: () => void;
  onPause?: () => void;
  canResume?: boolean;
  canPause?: boolean;
}

export const SessionDetailsModal: React.FC<SessionDetailsModalProps> = ({
  session,
  isOpen,
  onClose,
  onResume,
  onPause,
  canResume,
  canPause,
}) => {
  const [showJson, setShowJson] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Adaptive pagination based on dataset size
  const getItemsPerPage = (totalItems: number) => {
    if (totalItems > 100000) return 50; // 50 items for 100k+
    if (totalItems > 10000) return 75; // 75 items for 10k+
    return 100; // 100 items for smaller datasets
  };

  const ITEMS_PER_PAGE = session
    ? getItemsPerPage(session.results.length)
    : 100;

  if (!isOpen || !session) return null;

  const totalPages = Math.ceil(session.results.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentResults = session.results.slice(startIndex, endIndex);

  const activeResults = session.results.filter(
    (r) => r.data && !('error' in r.data)
  );
  const errorResults = session.results.filter(
    (r) => !r.data || 'error' in r.data
  );
  const pendingResults = session.results.filter((r) => !r.data);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{session.fileName}</h2>
              <p className="text-blue-100">
                {session.status} • {session.results.length.toLocaleString()}{' '}
                numbers
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200"
            >
              <svg
                className="w-8 h-8"
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

        {/* Stats & Controls */}
        <div className="p-6 border-b">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {session.totalNumbers.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {activeResults.length.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {errorResults.length.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {pendingResults.length.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {session.totalNumbers > 0
                  ? Math.round(
                      (activeResults.length / session.totalNumbers) * 100
                    )
                  : 0}
                %
              </div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-3">
            {canPause && (
              <button
                onClick={onPause}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
              >
                Pause Check
              </button>
            )}
            {canResume && (
              <button
                onClick={onResume}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Resume Check
              </button>
            )}
            <button
              onClick={() => setShowJson(true)}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Show Raw JSON
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Results ({session.results.length.toLocaleString()})
            </h3>

            {/* Pagination for large datasets */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1 text-sm">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50 text-xs"
                >
                  First
                </button>
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 10))}
                  disabled={currentPage <= 10}
                  className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50 text-xs"
                >
                  -10
                </button>
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                  Prev
                </button>
                <input
                  type="number"
                  value={currentPage}
                  onChange={(e) => {
                    const page = parseInt(e.target.value);
                    if (page >= 1 && page <= totalPages) {
                      setCurrentPage(page);
                    }
                  }}
                  className="w-16 px-1 py-1 border rounded text-center text-xs"
                  min={1}
                  max={totalPages}
                />
                <span className="text-xs">/ {totalPages.toLocaleString()}</span>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
                >
                  Next
                </button>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 10))
                  }
                  disabled={currentPage > totalPages - 10}
                  className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50 text-xs"
                >
                  +10
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50 text-xs"
                >
                  Last
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {currentResults.map((result, index) => (
              <div
                key={startIndex + index}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  result.data && !('error' in result.data)
                    ? 'bg-green-50 border-green-200'
                    : !result.data
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-red-50 border-red-200'
                }`}
              >
                <span className="font-mono text-sm">{result.number}</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    result.data && !('error' in result.data)
                      ? 'bg-green-100 text-green-800'
                      : !result.data
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  }`}
                >
                  {result.data && !('error' in result.data)
                    ? 'Active'
                    : !result.data
                      ? 'Pending'
                      : 'Failed'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* JSON Modal */}
      {showJson && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full h-3/4 p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowJson(false)}
            >
              ✕
            </button>
            <h3 className="text-lg font-bold mb-2">Session Raw JSON Data</h3>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto h-full">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
