import { useCallback, useEffect, useState } from 'react';
import { RateLimitInfo } from '../types';
import { useElectronAPI } from './useElectronAPI';

export const useRateLimit = () => {
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo | null>(
    null
  );
  const [isVisible, setIsVisible] = useState(false);
  const electronAPI = useElectronAPI();

  const updateRateLimit = useCallback((info: RateLimitInfo) => {
    setRateLimitInfo(info);
    // Show rate limit bar when we have meaningful data and usage is significant
    setIsVisible(info.used > 0 || info.remaining < info.limit * 0.9);
  }, []);

  useEffect(() => {
    // Listen for dedicated rate limit updates
    const handleRateLimitUpdate = (rateLimitInfo: RateLimitInfo) => {
      updateRateLimit(rateLimitInfo);
    };

    electronAPI.onRateLimitUpdate(handleRateLimitUpdate);

    return () => {
      electronAPI.removeAllListeners('rate-limit-update');
    };
  }, [electronAPI, updateRateLimit]);

  const getRemainingTimeText = useCallback(() => {
    if (!rateLimitInfo?.reset) return '';

    const now = Math.floor(Date.now() / 1000);
    const diffSeconds = rateLimitInfo.reset - now;

    if (diffSeconds <= 0) return 'Reset available';

    const minutes = Math.floor(diffSeconds / 60);
    const seconds = diffSeconds % 60;

    return `${minutes}m ${seconds}s`;
  }, [rateLimitInfo]);

  const getUsagePercentage = useCallback(() => {
    if (!rateLimitInfo) return 0;
    return (
      ((rateLimitInfo.limit - rateLimitInfo.remaining) / rateLimitInfo.limit) *
      100
    );
  }, [rateLimitInfo]);

  return {
    rateLimitInfo,
    isVisible,
    getRemainingTimeText,
    getUsagePercentage,
    updateRateLimit,
  };
};
