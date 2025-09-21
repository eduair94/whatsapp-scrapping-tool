import React from 'react';
import { RateLimitInfo } from '../types';

interface RateLimitDisplayProps {
  rateLimitInfo: RateLimitInfo | null;
  isVisible: boolean;
}

export const RateLimitDisplay: React.FC<RateLimitDisplayProps> = ({
  rateLimitInfo,
  isVisible,
}) => {
  if (!isVisible || !rateLimitInfo) return null;

  return (
    <div className="bg-yellow-100 border border-yellow-300 rounded p-4 m-4">
      <h3 className="font-bold">Rate Limit Info</h3>
      <p>
        Remaining: {rateLimitInfo.remaining}/{rateLimitInfo.limit}
      </p>
      <p>Reset: {new Date(rateLimitInfo.reset * 1000).toLocaleTimeString()}</p>
    </div>
  );
};
