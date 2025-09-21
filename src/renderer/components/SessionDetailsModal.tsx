import React, { useState } from 'react';
import { CheckSession } from '../types';
import {
  categorizeResults,
  getResultStatusClasses,
  getResultStatusLabel,
} from '../utils/resultUtils';

interface SessionDetailsModalProps {
  session: CheckSession | null;
  isOpen: boolean;
  onClose: () => void;
  onResume?: () => void;
  onPause?: () => void;
  onExport?: (session: CheckSession) => void;
  onToggleStar?: (session: CheckSession) => void;
  canResume?: boolean;
  canPause?: boolean;
}

export const SessionDetailsModal: React.FC<SessionDetailsModalProps> = ({
  session,
  isOpen,
  onClose,
  onResume,
  onPause,
  onExport,
  onToggleStar,
  canResume,
  canPause,
}) => {
  const [showJson, setShowJson] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterType, setFilterType] = useState<
    'all' | 'active' | 'not_on_whatsapp' | 'api_error' | 'pending'
  >('all');

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

  // Categorize results for better analysis
  const categorization = categorizeResults(session.results);

  // Filter results based on selected filter
  let filteredResults = session.results;
  switch (filterType) {
    case 'active':
      filteredResults = categorization.activeResults;
      break;
    case 'not_on_whatsapp':
      filteredResults = categorization.notOnWhatsAppResults;
      break;
    case 'api_error':
      filteredResults = categorization.apiErrorResults;
      break;
    case 'pending':
      filteredResults = categorization.pendingResults;
      break;
    default:
      filteredResults = session.results;
  }

  const totalPages = Math.ceil(filteredResults.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentResults = filteredResults.slice(startIndex, endIndex);

  const handleStarToggle = () => {
    if (onToggleStar && session) {
      onToggleStar(session);
    }
  };

  const handleExport = () => {
    if (onExport && session) {
      onExport(session);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold">{session.fileName}</h2>
                <button
                  onClick={handleStarToggle}
                  className="text-yellow-300 hover:text-yellow-100 transition-colors"
                  title={
                    session.isStarred
                      ? 'Remove from favorites'
                      : 'Add to favorites'
                  }
                >
                  {session.isStarred ? (
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ) : (
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
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                  )}
                </button>
              </div>
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
                {categorization.activeResults.length.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {categorization.notOnWhatsAppResults.length.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Not on WhatsApp</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {categorization.apiErrorResults.length.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">API Errors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {session.totalNumbers > 0
                  ? Math.round(
                      (categorization.activeResults.length /
                        session.totalNumbers) *
                        100
                    )
                  : 0}
                %
              </div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-3 flex-wrap">
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
              onClick={handleExport}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Export Results
            </button>
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
              Results ({filteredResults.length.toLocaleString()})
            </h3>

            {/* Filter Controls */}
            <div className="flex items-center gap-2">
              <select
                value={filterType}
                onChange={(e) =>
                  setFilterType(
                    e.target.value as
                      | 'all'
                      | 'active'
                      | 'not_on_whatsapp'
                      | 'api_error'
                      | 'pending'
                  )
                }
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Results</option>
                <option value="active">
                  Active ({categorization.activeResults.length})
                </option>
                <option value="not_on_whatsapp">
                  Not on WhatsApp ({categorization.notOnWhatsAppResults.length})
                </option>
                <option value="api_error">
                  API Errors ({categorization.apiErrorResults.length})
                </option>
                <option value="pending">
                  Pending ({categorization.pendingResults.length})
                </option>
              </select>
            </div>
          </div>

          {/* Pagination for large datasets */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 text-sm mb-4">
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

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {currentResults.map((result, index) => {
              const statusClasses = getResultStatusClasses(result);
              const statusLabel = getResultStatusLabel(result);

              return (
                <div
                  key={startIndex + index}
                  className={`flex items-center justify-between p-3 rounded-lg border ${statusClasses.row}`}
                >
                  <span className="font-mono text-sm">{result.number}</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses.badge}`}
                  >
                    {statusLabel}
                  </span>
                </div>
              );
            })}
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
