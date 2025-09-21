import React from 'react';
import { useRateLimit } from '../hooks/useRateLimit';

export const RateLimitBar: React.FC = () => {
  const { rateLimitInfo, isVisible, getRemainingTimeText, getUsagePercentage } =
    useRateLimit();

  if (!isVisible || !rateLimitInfo) {
    return null;
  }

  const usagePercentage = getUsagePercentage();
  const remainingTime = getRemainingTimeText();
  const isLowLimit = rateLimitInfo.remaining < 10;
  const isNearLimit = usagePercentage > 80;

  return (
    <div
      className={`w-full px-4 py-2 text-sm ${
        isLowLimit
          ? 'bg-red-50 border-b border-red-200'
          : isNearLimit
            ? 'bg-yellow-50 border-b border-yellow-200'
            : 'bg-blue-50 border-b border-blue-200'
      }`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span
              className={`font-medium ${
                isLowLimit
                  ? 'text-red-700'
                  : isNearLimit
                    ? 'text-yellow-700'
                    : 'text-blue-700'
              }`}
            >
              API Rate Limit
            </span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                isLowLimit
                  ? 'bg-red-100 text-red-800'
                  : isNearLimit
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-blue-100 text-blue-800'
              }`}
            >
              {rateLimitInfo.remaining} / {rateLimitInfo.limit} remaining
            </span>
          </div>

          {remainingTime && (
            <span
              className={`text-xs ${
                isLowLimit
                  ? 'text-red-600'
                  : isNearLimit
                    ? 'text-yellow-600'
                    : 'text-blue-600'
              }`}
            >
              Resets in {remainingTime}
            </span>
          )}
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              isLowLimit
                ? 'bg-red-500'
                : isNearLimit
                  ? 'bg-yellow-500'
                  : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
