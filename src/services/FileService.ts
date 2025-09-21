import csvParser from 'csv-parser';
import * as fs from 'fs';
import {
  PhoneNumber,
  PhoneNumberFormat,
  PhoneNumberUtil,
} from 'google-libphonenumber';
import * as path from 'path';
import * as xlsx from 'xlsx';
import {
  CheckSession,
  ExportOptions,
  FileParseResult,
  PhoneNumberData,
} from '../types';

export class FileService {
  private phoneUtil: PhoneNumberUtil;

  constructor() {
    this.phoneUtil = PhoneNumberUtil.getInstance();
  }

  async parseFile(filePath: string): Promise<FileParseResult> {
    const fileName = path.basename(filePath);
    const extension = path.extname(filePath).toLowerCase();

    try {
      let rawNumbers: string[] = [];

      switch (extension) {
        case '.csv':
          rawNumbers = await this.parseCsvFile(filePath);
          break;
        case '.xlsx':
        case '.xls':
          rawNumbers = await this.parseExcelFile(filePath);
          break;
        case '.txt':
          rawNumbers = await this.parseTextFile(filePath);
          break;
        default:
          throw new Error(`Unsupported file format: ${extension}`);
      }

      // Process and validate phone numbers
      const phoneNumbers = this.processPhoneNumbers(rawNumbers);

      const validNumbers = phoneNumbers.filter((num) => num.isValid).length;
      const invalidNumbers = phoneNumbers.length - validNumbers;

      return {
        fileName,
        totalNumbers: phoneNumbers.length,
        validNumbers,
        invalidNumbers,
        numbers: phoneNumbers,
      };
    } catch (error) {
      throw new Error(
        `Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async parseTextInput(textInput: string): Promise<FileParseResult> {
    try {
      // Split text input by lines and filter out empty lines
      const rawNumbers = textInput
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && this.looksLikePhoneNumber(line));

      if (rawNumbers.length === 0) {
        throw new Error('No valid phone numbers found in the text input');
      }

      // Process and validate phone numbers
      const phoneNumbers = this.processPhoneNumbers(rawNumbers);

      const validNumbers = phoneNumbers.filter((num) => num.isValid).length;
      const invalidNumbers = phoneNumbers.length - validNumbers;

      return {
        fileName: 'text-input',
        totalNumbers: phoneNumbers.length,
        validNumbers,
        invalidNumbers,
        numbers: phoneNumbers,
      };
    } catch (error) {
      throw new Error(
        `Failed to process text input: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async parseCsvFile(filePath: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const numbers: string[] = [];
      const stream = fs.createReadStream(filePath);

      stream
        .pipe(csvParser({ headers: false }))
        .on('data', (row: any) => {
          // Try to find phone numbers in any column
          const values = Object.values(row) as string[];
          for (const value of values) {
            if (value && typeof value === 'string') {
              const cleanValue = value.trim();
              if (this.looksLikePhoneNumber(cleanValue)) {
                numbers.push(cleanValue);
              }
            }
          }
        })
        .on('end', () => {
          resolve(numbers);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  private async parseExcelFile(filePath: string): Promise<string[]> {
    try {
      const workbook = xlsx.readFile(filePath);
      const numbers: string[] = [];

      // Process all sheets
      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

        for (const row of jsonData as any[][]) {
          for (const cell of row) {
            if (cell && typeof cell === 'string') {
              const cleanValue = cell.trim();
              if (this.looksLikePhoneNumber(cleanValue)) {
                numbers.push(cleanValue);
              }
            } else if (typeof cell === 'number') {
              // Handle numeric phone numbers
              const strValue = cell.toString();
              if (this.looksLikePhoneNumber(strValue)) {
                numbers.push(strValue);
              }
            }
          }
        }
      }

      return numbers;
    } catch (error) {
      throw new Error(
        `Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async parseTextFile(filePath: string): Promise<string[]> {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split(/\r?\n/);
      const numbers: string[] = [];

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine && this.looksLikePhoneNumber(trimmedLine)) {
          numbers.push(trimmedLine);
        }
      }

      return numbers;
    } catch (error) {
      throw new Error(
        `Failed to parse text file: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private looksLikePhoneNumber(value: string): boolean {
    // Remove common non-digit characters
    const cleaned = value.replace(/[\s\-()+.]/g, '');

    // Check if it's mostly digits and has reasonable length
    const digitCount = (cleaned.match(/\d/g) || []).length;
    const totalLength = cleaned.length;

    // Must be at least 7 digits and at most 15 digits (international standard)
    // At least 80% of characters should be digits
    return (
      digitCount >= 7 && digitCount <= 15 && digitCount / totalLength >= 0.8
    );
  }

  private processPhoneNumbers(rawNumbers: string[]): PhoneNumberData[] {
    const processed: PhoneNumberData[] = [];
    const seen = new Set<string>();

    for (const rawNumber of rawNumbers) {
      if (!rawNumber || typeof rawNumber !== 'string') continue;

      const original = rawNumber.trim();
      if (!original || seen.has(original)) continue;

      seen.add(original);

      try {
        const phoneData = this.validateAndCleanPhoneNumber(original);
        processed.push(phoneData);
      } catch (error) {
        // If validation fails, still include it but mark as invalid
        processed.push({
          original,
          cleaned: original,
          isValid: false,
          error:
            error instanceof Error ? error.message : 'Invalid phone number',
        });
      }
    }

    return processed;
  }

  private validateAndCleanPhoneNumber(phoneNumber: string): PhoneNumberData {
    try {
      // Try to parse with different default regions
      const regions = [
        'US',
        'GB',
        'CA',
        'AU',
        'DE',
        'FR',
        'ES',
        'IT',
        'BR',
        'IN',
      ];
      let parsedNumber: PhoneNumber | null = null;
      let usedRegion = '';

      // First try parsing as international number
      try {
        // clean digits from phone number and add a + at the start
        const cleaned = phoneNumber.replace(/\D/g, '');
        if (cleaned) {
          phoneNumber = `+${cleaned}`;
        }
        parsedNumber = this.phoneUtil.parse(phoneNumber);
        usedRegion = this.phoneUtil.getRegionCodeForNumber(parsedNumber) || '';
      } catch {
        // If that fails, try with different default regions
        for (const region of regions) {
          try {
            parsedNumber = this.phoneUtil.parse(phoneNumber, region);
            if (this.phoneUtil.isValidNumber(parsedNumber)) {
              usedRegion = region;
              break;
            }
          } catch {
            continue;
          }
        }
      }

      if (!parsedNumber) {
        throw new Error('Could not parse phone number');
      }

      const isValid = this.phoneUtil.isValidNumber(parsedNumber);

      if (!isValid) {
        throw new Error('Phone number is not valid');
      }

      // Format the number in international format
      const cleaned = this.phoneUtil.format(
        parsedNumber,
        PhoneNumberFormat.E164
      );
      const country =
        this.phoneUtil.getRegionCodeForNumber(parsedNumber) || usedRegion;
      const countryCode = parsedNumber.getCountryCode()?.toString();

      return {
        original: phoneNumber,
        cleaned,
        country,
        countryCode,
        isValid: true,
      };
    } catch (error) {
      return {
        original: phoneNumber,
        cleaned: phoneNumber,
        isValid: false,
        error: error instanceof Error ? error.message : 'Validation failed',
      };
    }
  }

  async exportResults(
    session: CheckSession,
    options: ExportOptions,
    filePath: string
  ): Promise<string> {
    try {
      const {
        format,
        includeErrors = true,
        includeDetails = true,
        filterWhatsAppOnly = false,
      } = options;

      // Filter results based on options
      let results = session.results;
      if (filterWhatsAppOnly) {
        results = results.filter(
          (result) =>
            result.data &&
            typeof result.data === 'object' &&
            'isWAContact' in result.data &&
            (result.data as any).isWAContact
        );
      }

      if (!includeErrors) {
        results = results.filter((result) => !result.error);
      }

      switch (format) {
        case 'json':
          return await this.exportToJson(
            session,
            results,
            filePath,
            includeDetails
          );
        case 'csv':
          return await this.exportToCsv(
            session,
            results,
            filePath,
            includeDetails
          );
        case 'xlsx':
          return await this.exportToExcel(
            session,
            results,
            filePath,
            includeDetails
          );
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error) {
      throw new Error(
        `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async exportToJson(
    session: CheckSession,
    results: any[],
    filePath: string,
    includeDetails: boolean
  ): Promise<string> {
    const exportData = {
      session: {
        id: session.id,
        fileName: session.fileName,
        startTime: session.startTime,
        endTime: session.endTime,
        totalNumbers: session.totalNumbers,
        completedNumbers: session.completedNumbers,
        successfulChecks: session.successfulChecks,
        failedChecks: session.failedChecks,
        status: session.status,
      },
      results: includeDetails
        ? results
        : results.map((r) => ({
            number: r.number,
            hasWhatsApp: r.data && (r.data as any).isWAContact,
            error: r.error,
          })),
    };

    fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2), 'utf-8');
    return filePath;
  }

  private async exportToCsv(
    session: CheckSession,
    results: any[],
    filePath: string,
    includeDetails: boolean
  ): Promise<string> {
    const headers = [
      'Phone Number',
      'Has WhatsApp',
      'Is Business',
      'Name',
      'Error',
    ];
    if (includeDetails) {
      headers.push('About', 'Country Code', 'Profile Picture');
    }

    const csvLines = [headers.join(',')];

    for (const result of results) {
      const data = result.data as any;
      const row = [
        `"${result.number}"`,
        data && data.isWAContact ? 'Yes' : 'No',
        data && data.isBusiness ? 'Yes' : 'No',
        data && data.name ? `"${data.name.replace(/"/g, '""')}"` : '""',
        result.error ? `"${result.error.replace(/"/g, '""')}"` : '""',
      ];

      if (includeDetails) {
        row.push(
          data && data.about ? `"${data.about.replace(/"/g, '""')}"` : '""',
          data && data.countryCode ? `"${data.countryCode}"` : '""',
          data && data.profilePic ? `"${data.profilePic}"` : '""'
        );
      }

      csvLines.push(row.join(','));
    }

    fs.writeFileSync(filePath, csvLines.join('\n'), 'utf-8');
    return filePath;
  }

  private async exportToExcel(
    session: CheckSession,
    results: any[],
    filePath: string,
    includeDetails: boolean
  ): Promise<string> {
    const workbook = xlsx.utils.book_new();

    // Create summary sheet
    const summaryData = [
      ['Session Summary'],
      ['Session ID', session.id],
      ['File Name', session.fileName],
      ['Start Time', session.startTime.toISOString()],
      ['End Time', session.endTime?.toISOString() || 'N/A'],
      ['Total Numbers', session.totalNumbers],
      ['Completed Numbers', session.completedNumbers],
      ['Successful Checks', session.successfulChecks],
      ['Failed Checks', session.failedChecks],
      ['Status', session.status],
    ];

    const summarySheet = xlsx.utils.aoa_to_sheet(summaryData);
    xlsx.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Create results sheet
    const headers = [
      'Phone Number',
      'Has WhatsApp',
      'Is Business',
      'Name',
      'Error',
    ];
    if (includeDetails) {
      headers.push(
        'About',
        'Country Code',
        'Profile Picture',
        'Verified Level'
      );
    }

    const resultsData = [headers];

    for (const result of results) {
      const data = result.data as any;
      const row = [
        result.number,
        data && data.isWAContact ? 'Yes' : 'No',
        data && data.isBusiness ? 'Yes' : 'No',
        data && data.name ? data.name : '',
        result.error || '',
      ];

      if (includeDetails) {
        row.push(
          data && data.about ? data.about : '',
          data && data.countryCode ? data.countryCode : '',
          data && data.profilePic ? data.profilePic : '',
          data && data.verifiedLevel ? data.verifiedLevel.toString() : ''
        );
      }

      resultsData.push(row);
    }

    const resultsSheet = xlsx.utils.aoa_to_sheet(resultsData);
    xlsx.utils.book_append_sheet(workbook, resultsSheet, 'Results');

    // Write file
    xlsx.writeFile(workbook, filePath);
    return filePath;
  }

  generateRandomPhoneNumbers(
    country: string,
    quantity: number
  ): PhoneNumberData[] {
    const phoneNumbers: PhoneNumberData[] = [];
    const generatedNumbers = new Set<string>();

    // Country-specific phone number patterns and metadata
    const countryConfigs = {
      US: {
        countryCode: '1',
        patterns: [
          () =>
            `+1${this.randomDigits(3, [2, 3, 4, 5, 6, 7, 8, 9])}${this.randomDigits(3, [2, 3, 4, 5, 6, 7, 8, 9])}${this.randomDigits(4)}`,
        ],
      },
      CA: {
        countryCode: '1',
        patterns: [
          () =>
            `+1${this.randomDigits(3, [2, 3, 4, 5, 6, 7, 8, 9])}${this.randomDigits(3, [2, 3, 4, 5, 6, 7, 8, 9])}${this.randomDigits(4)}`,
        ],
      },
      GB: {
        countryCode: '44',
        patterns: [
          () => `+447${this.randomDigits(9)}`, // Mobile
          () => `+4420${this.randomDigits(8)}`, // London
          () => `+44121${this.randomDigits(7)}`, // Birmingham
        ],
      },
      DE: {
        countryCode: '49',
        patterns: [
          () => `+4915${this.randomDigits(8)}`, // Mobile
          () => `+4917${this.randomDigits(8)}`, // Mobile
          () => `+4930${this.randomDigits(8)}`, // Berlin
        ],
      },
      FR: {
        countryCode: '33',
        patterns: [
          () => `+336${this.randomDigits(8)}`, // Mobile
          () => `+337${this.randomDigits(8)}`, // Mobile
          () => `+331${this.randomDigits(8)}`, // Paris
        ],
      },
      ES: {
        countryCode: '34',
        patterns: [
          () => `+346${this.randomDigits(8)}`, // Mobile
          () => `+347${this.randomDigits(8)}`, // Mobile
          () => `+3491${this.randomDigits(7)}`, // Madrid
        ],
      },
      IT: {
        countryCode: '39',
        patterns: [
          () => `+3933${this.randomDigits(8)}`, // Mobile
          () => `+3934${this.randomDigits(8)}`, // Mobile
          () => `+390${this.randomDigits(2)}${this.randomDigits(8)}`, // Landline
        ],
      },
      AU: {
        countryCode: '61',
        patterns: [
          () => `+614${this.randomDigits(8)}`, // Mobile
          () => `+612${this.randomDigits(8)}`, // Sydney
          () => `+613${this.randomDigits(8)}`, // Melbourne
        ],
      },
      BR: {
        countryCode: '55',
        patterns: [
          () => `+5511${9}${this.randomDigits(8)}`, // São Paulo mobile
          () => `+5521${9}${this.randomDigits(8)}`, // Rio de Janeiro mobile
          () => `+5511${this.randomDigits(8)}`, // São Paulo landline
        ],
      },
      IN: {
        countryCode: '91',
        patterns: [
          () =>
            `+91${this.randomDigits(1, [6, 7, 8, 9])}${this.randomDigits(9)}`, // Mobile
          () => `+9111${this.randomDigits(8)}`, // Delhi
          () => `+9122${this.randomDigits(8)}`, // Mumbai
        ],
      },
      MX: {
        countryCode: '52',
        patterns: [
          () => `+521${this.randomDigits(10)}`, // Mobile
          () => `+5255${this.randomDigits(8)}`, // Mexico City
        ],
      },
      AR: {
        countryCode: '54',
        patterns: [
          () => `+5491${this.randomDigits(8)}`, // Buenos Aires mobile
          () => `+5411${this.randomDigits(8)}`, // Buenos Aires landline
        ],
      },
      JP: {
        countryCode: '81',
        patterns: [
          () => `+81${this.randomDigits(1, [7, 8, 9])}0${this.randomDigits(8)}`, // Mobile
          () => `+813${this.randomDigits(8)}`, // Tokyo
        ],
      },
      KR: {
        countryCode: '82',
        patterns: [
          () => `+8210${this.randomDigits(8)}`, // Mobile
          () => `+822${this.randomDigits(8)}`, // Seoul
        ],
      },
      CN: {
        countryCode: '86',
        patterns: [
          () =>
            `+861${this.randomDigits(1, [3, 4, 5, 6, 7, 8, 9])}${this.randomDigits(9)}`, // Mobile
          () => `+8610${this.randomDigits(8)}`, // Beijing
        ],
      },
    };

    const config = countryConfigs[country as keyof typeof countryConfigs];
    if (!config) {
      throw new Error(
        `Country ${country} is not supported for random number generation`
      );
    }

    let attempts = 0;
    const maxAttempts = quantity * 10; // Prevent infinite loops

    while (phoneNumbers.length < quantity && attempts < maxAttempts) {
      attempts++;

      // Choose a random pattern for this country
      const randomPattern =
        config.patterns[Math.floor(Math.random() * config.patterns.length)];
      const phoneNumber = randomPattern();

      // Avoid duplicates
      if (generatedNumbers.has(phoneNumber)) {
        continue;
      }

      try {
        // Validate the generated number using the phone util
        const phoneData = this.validateAndCleanPhoneNumber(phoneNumber);

        if (phoneData.isValid) {
          generatedNumbers.add(phoneNumber);
          phoneNumbers.push(phoneData);
        }
      } catch (error) {
        // If generated number is somehow invalid, skip it and try again
        continue;
      }
    }

    return phoneNumbers;
  }

  private randomDigits(length: number, allowedFirstDigits?: number[]): string {
    let result = '';

    for (let i = 0; i < length; i++) {
      if (i === 0 && allowedFirstDigits && allowedFirstDigits.length > 0) {
        // Use allowed first digits for the first digit
        result +=
          allowedFirstDigits[
            Math.floor(Math.random() * allowedFirstDigits.length)
          ];
      } else {
        result += Math.floor(Math.random() * 10);
      }
    }

    return result;
  }
}
