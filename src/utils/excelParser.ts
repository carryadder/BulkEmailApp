import RNFS from 'react-native-fs';
import * as XLSX from 'xlsx';
import {Recipient} from '../types';

export const parseExcelFile = async (
  fileUri: string,
): Promise<{recipients: Recipient[]; columns: string[]}> => {
  try {
    // Read the file as base64
    const fileContent = await RNFS.readFile(fileUri, 'base64');

    // Parse the workbook
    const workbook = XLSX.read(fileContent, {type: 'base64'});

    // Get the first sheet
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      throw new Error('Excel file has no sheets');
    }

    const worksheet = workbook.Sheets[firstSheetName];
    if (!worksheet) {
      throw new Error('Could not read worksheet');
    }

    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json<Record<string, string>>(
      worksheet,
      {defval: ''},
    );

    if (jsonData.length === 0) {
      throw new Error('Excel file is empty or has no data rows');
    }

    // Extract column names from the first row
    const columns = Object.keys(jsonData[0]);

    // Find the email column (case-insensitive search)
    const emailColumn = columns.find(
      col =>
        col.toLowerCase() === 'email' ||
        col.toLowerCase() === 'e-mail' ||
        col.toLowerCase() === 'email address' ||
        col.toLowerCase() === 'emailaddress',
    );

    if (!emailColumn) {
      throw new Error(
        'No email column found. Please ensure your Excel file has a column named "Email".',
      );
    }

    // Find name column
    const nameColumn = columns.find(
      col =>
        col.toLowerCase() === 'name' ||
        col.toLowerCase() === 'full name' ||
        col.toLowerCase() === 'fullname' ||
        col.toLowerCase() === 'recipient',
    );

    // Map to Recipient objects
    const recipients: Recipient[] = jsonData
      .filter(row => {
        const email = String(row[emailColumn] || '').trim();
        return email.length > 0 && email.includes('@');
      })
      .map(row => {
        const recipient: Recipient = {
          email: String(row[emailColumn] || '').trim(),
        };

        if (nameColumn) {
          recipient.name = String(row[nameColumn] || '').trim();
        }

        // Include all other columns as dynamic fields
        columns.forEach(col => {
          if (col !== emailColumn) {
            recipient[col] = String(row[col] || '').trim();
          }
        });

        return recipient;
      });

    return {recipients, columns};
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to parse Excel file');
  }
};

// Merge template with recipient data - replaces {{field}} placeholders
export const mergeTemplate = (
  template: string,
  recipient: Recipient,
): string => {
  let result = template;
  Object.keys(recipient).forEach(key => {
    const value = recipient[key] || '';
    const regex = new RegExp(`\\{\\{\\s*${escapeRegex(key)}\\s*\\}\\}`, 'gi');
    result = result.replace(regex, value);
  });
  return result;
};

const escapeRegex = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};
