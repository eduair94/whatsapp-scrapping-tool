import React from 'react';
import { BulkCheckProgress } from '../types';

interface CheckingProgressProps {
  progress: BulkCheckProgress | null;
  onCancel: () => void;
}

export const CheckingProgress: React.FC<CheckingProgressProps> = ({
  progress,
  onCancel,
}) => {
  if (!progress) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h2>Checking Progress</h2>
      <p>
        Completed: {progress.completed} / {progress.total}
      </p>
      <p>Percentage: {progress.percentage}%</p>
      <button
        onClick={onCancel}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
      >
        Cancel
      </button>
    </div>
  );
};
