const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[\d+\-()\s]{7,25}$/;

export interface ReportValidationValues {
  itemName: string;
  reporterName: string;
  category: string;
  location: string;
  building: string;
  dateReported: string;
  timeReported: string;
  brand: string;
  color: string;
  identifyingMarks: string;
  description: string;
  contactNumber: string;
  email: string;
  imageFile?: File | null;
}

export function isValidEmail(value: string) {
  return EMAIL_PATTERN.test(String(value).trim());
}

export function isValidPhone(value: string) {
  return PHONE_PATTERN.test(String(value).trim());
}

export function validateReportForm(values: ReportValidationValues) {
  const errors: Record<string, string> = {};

  if (!values.itemName.trim()) {
    errors.itemName = 'Item name is required.';
  } else if (values.itemName.length > 80) {
    errors.itemName = 'Item name cannot exceed 80 characters.';
  }

  if (!values.reporterName.trim()) {
    errors.reporterName = 'Reporter name is required.';
  } else if (values.reporterName.length > 80) {
    errors.reporterName = 'Reporter name cannot exceed 80 characters.';
  }

  if (!values.category) {
    errors.category = 'Category is required.';
  }

  if (!values.location.trim()) {
    errors.location = 'Location is required.';
  } else if (values.location.length > 80) {
    errors.location = 'Location cannot exceed 80 characters.';
  }

  if (!values.building.trim()) {
    errors.building = 'Building is required.';
  } else if (values.building.length > 80) {
    errors.building = 'Building cannot exceed 80 characters.';
  }

  if (!values.dateReported) {
    errors.dateReported = 'Date is required.';
  }

  if (!values.timeReported) {
    errors.timeReported = 'Time is required.';
  }

  if (!values.brand.trim()) {
    errors.brand = 'Brand is required.';
  } else if (values.brand.length > 40) {
    errors.brand = 'Brand cannot exceed 40 characters.';
  }

  if (!values.color.trim()) {
    errors.color = 'Color is required.';
  } else if (values.color.length > 30) {
    errors.color = 'Color cannot exceed 30 characters.';
  }

  if (values.identifyingMarks && values.identifyingMarks.length > 120) {
    errors.identifyingMarks = 'Identifying marks cannot exceed 120 characters.';
  }

  if (values.description && values.description.length > 280) {
    errors.description = 'Description cannot exceed 280 characters.';
  }

  if (!values.contactNumber.trim()) {
    errors.contactNumber = 'Contact number is required.';
  } else if (!isValidPhone(values.contactNumber)) {
    errors.contactNumber = 'Enter a valid phone number.';
  }

  if (!values.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!isValidEmail(values.email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (values.imageFile) {
    const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!acceptedTypes.includes(values.imageFile.type)) {
      errors.imageFile = 'Supported image types: jpg, jpeg, png, webp.';
    }
  }

  return errors;
}
