import { WhatsAppChecker } from 'whatsapp-number-checker';
import {
  AppSettings,
  BulkCheckOptions,
  BulkCheckProgress,
  PhoneNumberData,
  WhatsAppCheckResult,
} from '../types';

export class WhatsAppService {
  private checker: WhatsAppChecker;
  private isCancelled: boolean = false;

  constructor(settings: AppSettings) {
    console.log('Settings', settings);
    this.checker = new WhatsAppChecker({
      apiKey: settings.apiKey,
      throwOnLimit: settings.throwOnLimit || false,
      timeout: settings.timeout || 15000,
      maxRetries: settings.maxRetries || 3,
      retryDelay: settings.retryDelay || 1000,
      baseURL: 'https://whatsapp-data1.p.rapidapi.com',
    });
  }

  async checkSingle(phoneNumber: string): Promise<WhatsAppCheckResult> {
    try {
      console.log('Checking phone number:', phoneNumber);

      const result = await this.checker.checkNumber(phoneNumber);
      console.log('API result:', result);

      return {
        number: phoneNumber,
        data: result.data,
        error: result.error,
        rateLimitInfo: result.rateLimitInfo,
      } as WhatsAppCheckResult;
    } catch (error) {
      console.error('Error in checkSingle:', error);
      return {
        number: phoneNumber,
        data: null,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async checkBulk(
    phoneNumbers: PhoneNumberData[],
    options: BulkCheckOptions
  ): Promise<WhatsAppCheckResult[]> {
    const results: WhatsAppCheckResult[] = [];
    let completed = 0;
    let successful = 0;
    let failed = 0;
    let rateLimited = 0;

    this.isCancelled = false;

    try {
      // Prepare numbers for checking (only valid ones)
      const numbersToCheck = phoneNumbers
        .filter((num) => num.isValid && num.cleaned)
        .map((num) => num.cleaned);

      if (numbersToCheck.length === 0) {
        throw new Error('No valid numbers to check');
      }

      // Use the built-in bulk check with progress tracking
      await this.checker.checkBulk(numbersToCheck, {
        onProgress: (
          completedCount: number,
          totalCount: number,
          current: any
        ) => {
          if (this.isCancelled) {
            return;
          }

          completed = completedCount;

          // Count successful/failed checks
          if (current.data && !('error' in current.data)) {
            const data = current.data as any;
            if (data.isWAContact) {
              successful++;
            } else {
              failed++;
            }
          } else {
            failed++;
          }

          // Create progress object
          const progress: BulkCheckProgress = {
            completed,
            total: totalCount,
            percentage: Math.round((completed / totalCount) * 100),
            successful,
            failed,
            rateLimited,
            currentNumber: current.number,
            currentResult: {
              number: current.number,
              data: current.data,
              error: current.error,
              rateLimitInfo: current.rateLimitInfo,
            },
          };

          // Call progress callback
          if (options.onProgress) {
            options.onProgress(progress);
          }

          // Store result
          results.push({
            number: current.number,
            data: current.data,
            error: current.error,
            rateLimitInfo: current.rateLimitInfo,
          });
        },
        onRateLimit: (rateLimitInfo) => {
          rateLimited++;
          if (options.onRateLimit) {
            options.onRateLimit(rateLimitInfo);
          }
        },
        stopOnError: options.stopOnError || false,
        maxRetries: options.maxRetries,
      });

      // Call completion callback
      if (options.onComplete && !this.isCancelled) {
        options.onComplete(results);
      }

      return results;
    } catch (error) {
      console.error('Bulk check error:', error);

      // If we have partial results, return them
      if (results.length > 0) {
        return results;
      }

      throw error;
    }
  }

  cancelCheck(): void {
    this.isCancelled = true;
    // Clear the queue to stop pending requests
    if (this.checker && typeof this.checker.clearQueue === 'function') {
      this.checker.clearQueue();
    }
  }

  getRateLimitInfo() {
    return this.checker.getRateLimitInfo();
  }

  getCurrentRateInterval(): number {
    return this.checker.getCurrentRateInterval();
  }

  getQueueLength(): number {
    return this.checker.getQueueLength();
  }
}
