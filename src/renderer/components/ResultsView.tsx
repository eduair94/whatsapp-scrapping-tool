import React from 'react';
import { CheckSession, WhatsAppResult } from '../types';

interface ResultsViewProps {
  session: CheckSession | null;
  results: WhatsAppResult[];
  onViewDetails: (result: WhatsAppResult) => void;
  onNewCheck: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  session: _session,
  results,
  onViewDetails,
  onNewCheck,
}) => {
  return (
    <div className="p-6">
      <h2>Results ({results.length} checked)</h2>
      <div className="mt-4">
        {results.map((result, index) => (
          <div key={index} className="border p-2 mb-2">
            <span>{result.number}</span>
            <button
              onClick={() => onViewDetails(result)}
              className="ml-2 px-2 py-1 bg-blue-600 text-white text-sm rounded"
            >
              Details
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={onNewCheck}
        className="mt-4 px-4 py-2 bg-green-600 text-white rounded"
      >
        New Check
      </button>
    </div>
  );
};
