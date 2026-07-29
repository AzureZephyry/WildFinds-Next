export function generateReferenceNumber(reportType: string, dateReported: string, existingReferenceNumbers: string[]) {
  const prefix = reportType === 'found' ? 'F' : 'L';
  const datePart = dateReported.replace(/-/g, '');
  const base = `${prefix}${datePart}`;
  const existing = new Set(existingReferenceNumbers);
  let counter = 1;

  while (existing.has(`${base}-${counter}`)) {
    counter += 1;
  }

  return `${base}-${counter}`;
}
