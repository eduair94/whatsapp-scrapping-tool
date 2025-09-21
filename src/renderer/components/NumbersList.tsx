import React from 'react';
import { PhoneNumberData } from '../types';

interface NumbersListProps {
  numbers: PhoneNumberData[];
  onAddNumbers: (newNumbers: PhoneNumberData[]) => void;
  onRemoveNumbers: (indices: number[]) => void;
  onStartCheck: () => void;
  isChecking: boolean;
}

export const NumbersList: React.FC<NumbersListProps> = ({
  numbers,
  onStartCheck,
  isChecking,
}) => {
  return (
    <div className="p-6">
      <h2>Numbers List ({numbers.length} numbers)</h2>
      <button
        onClick={onStartCheck}
        disabled={isChecking || numbers.length === 0}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        {isChecking ? 'Checking...' : 'Start Check'}
      </button>
    </div>
  );
};
