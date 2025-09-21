import React from 'react';
import { WhatsAppResult } from '../types';

interface DetailsModalProps {
  result: WhatsAppResult | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DetailsModal: React.FC<DetailsModalProps> = ({
  result,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !result) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full">
        <h2 className="text-xl font-bold mb-4">Details for {result.number}</h2>
        <pre className="text-sm bg-gray-100 p-4 rounded">
          {JSON.stringify(result.data, null, 2)}
        </pre>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-gray-600 text-white rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};
