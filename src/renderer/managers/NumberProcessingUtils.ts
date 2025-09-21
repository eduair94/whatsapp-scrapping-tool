import toast from 'react-hot-toast';
import { PhoneNumberData } from '../types';

export class NumberProcessingUtils {
  static generateNumbersKey(numbers: PhoneNumberData[]): string {
    return `${numbers.length}-${numbers[0]?.cleaned || 'empty'}`;
  }

  static filterDuplicates(
    existingNumbers: PhoneNumberData[],
    newNumbers: PhoneNumberData[]
  ): { uniqueNumbers: PhoneNumberData[]; duplicateCount: number } {
    const existingSet = new Set(existingNumbers.map((n) => n.cleaned));
    const uniqueNumbers = newNumbers.filter(
      (newNum) => !existingSet.has(newNum.cleaned)
    );
    const duplicateCount = newNumbers.length - uniqueNumbers.length;

    return { uniqueNumbers, duplicateCount };
  }

  static showDuplicateToast(
    uniqueCount: number,
    duplicateCount: number,
    totalCount: number
  ): void {
    if (duplicateCount > 0) {
      toast.success(
        `Added ${uniqueCount} new numbers, skipped ${duplicateCount} duplicates (Total: ${totalCount})`
      );
    } else {
      toast.success(`Added ${uniqueCount} more numbers (Total: ${totalCount})`);
    }
  }

  static preventDuplicateToasts(
    loadedFileIds: React.MutableRefObject<Set<string>>,
    numbersKey: string,
    onFirstLoad: () => void,
    onSubsequentLoad: () => void
  ): void {
    if (!loadedFileIds.current.has(numbersKey)) {
      onFirstLoad();
      loadedFileIds.current.add(numbersKey);

      // Clear the loaded file ID after a short delay to allow future loads
      setTimeout(() => {
        loadedFileIds.current.delete(numbersKey);
      }, 2000);
    } else {
      onSubsequentLoad();
    }
  }
}
