import * as XLSX from 'xlsx';
import mammoth from 'mammoth';

/**
 * Parses an Excel file buffer and returns a CSV string representation of the first sheet.
 */
export function parseExcel(buffer: Buffer): string {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('Excel file is empty');
  }
  const worksheet = workbook.Sheets[firstSheetName];
  // Convert to CSV to get a text representation
  return XLSX.utils.sheet_to_csv(worksheet);
}

/**
 * Parses a Word document buffer and extracts raw text.
 */
export async function parseWord(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

/**
 * Main entry point to parse an uploaded file based on its type.
 * Supports .xlsx, .xls, and .docx.
 */
export async function parseFile(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    return parseExcel(buffer);
  } else if (fileName.endsWith('.docx')) {
    return parseWord(buffer);
  } else {
    throw new Error(`Unsupported file type: ${file.name}. Only .xlsx, .xls, and .docx are supported.`);
  }
}
