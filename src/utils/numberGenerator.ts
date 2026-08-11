// ─────────────────────────────────────────────────────────────────────────
// QuoteFlow ERP Custom Quotation Serial Generator
// Rule: [4-Letter Company Prefix]-[YYYY][MM]A[Continuous 3-Digit Serial]
// ─────────────────────────────────────────────────────────────────────────
import type { Quotation } from '../types';

export function generateCustomQuotationNumber(
  companyName: string = 'ZIPCON',
  existingQuotations: Quotation[] = [],
  dateString?: string
): string {
  // 1. First 4 characters of Company Name (uppercase, alphanumeric only)
  const cleanCompany = companyName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
  
  const companyPrefix = (cleanCompany.substring(0, 4) || 'ZIPC').padEnd(4, 'X');

  // 2. Year & Month
  const d = dateString ? new Date(dateString) : new Date();
  const year = d.getFullYear(); // e.g. 2026
  const month = String(d.getMonth() + 1).padStart(2, '0'); // e.g. 08

  // 3. Continuous Serial Number (Count of existing quotations + 1)
  const serialCount = (existingQuotations?.length || 0) + 1;
  const serialNumber = String(serialCount).padStart(3, '0'); // e.g. 001

  // Format: IMPR-202608A001
  return `${companyPrefix}-${year}${month}A${serialNumber}`;
}
