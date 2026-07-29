import { mockItems } from '../data/mockItems';
import { generateReferenceNumber as generateSessionReferenceNumber } from './referenceGenerator';
import type { ReportSubmissionPayload } from '../types/reports';

const ITEM_CATEGORIES = [
  'ID / Access',
  'Accessories',
  'Personal Belongings',
  'Jewellery',
  'Stationery',
  'Other',
] as const;

export function getItemCategories() {
  return ITEM_CATEGORIES;
}

export function generateItemId(reportType: 'lost' | 'found') {
  const timestamp = Date.now();
  const prefix = reportType === 'found' ? 'found' : 'lost';
  return `${prefix}-${timestamp}`;
}

export function createReportSubmission(reportType: 'lost' | 'found', values: Record<string, unknown>): ReportSubmissionPayload {
  const itemType = reportType === 'found' ? 'Found' : 'Lost';
  const existingReferenceNumbers = mockItems.map((item) => item.referenceNumber || '');

  return {
    id: generateItemId(reportType),
    referenceNumber: generateSessionReferenceNumber(reportType, String(values.dateReported), existingReferenceNumbers),
    name: String(values.itemName),
    category: String(values.category),
    location: String(values.location),
    building: String(values.building),
    dateReported: String(values.dateReported),
    timeReported: String(values.timeReported),
    brand: String(values.brand),
    color: String(values.color),
    identifyingMarks: String(values.identifyingMarks),
    description: String(values.description),
    contactNumber: String(values.contactNumber),
    email: String(values.email),
    imageUrl: String(values.imageUrl || ''),
    status: 'Submitted',
    type: itemType,
  };
}
