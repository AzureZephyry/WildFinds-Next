export function validateReportImage(file: File | null) {
  if (!file) {
    return null;
  }

  const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return acceptedTypes.includes(file.type) ? null : 'Supported image types: jpg, jpeg, png, webp.';
}
