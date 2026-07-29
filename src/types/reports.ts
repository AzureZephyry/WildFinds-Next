export interface ReportFormValues {
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
  imageFile: File | null;
  imagePreviewUrl: string;
}

export interface ReportFormErrors {
  itemName?: string;
  reporterName?: string;
  category?: string;
  form?: string;
  location?: string;
  building?: string;
  dateReported?: string;
  timeReported?: string;
  brand?: string;
  color?: string;
  identifyingMarks?: string;
  description?: string;
  contactNumber?: string;
  email?: string;
  imageFile?: string;
}

export interface ReportFormProps {
  reportType: "lost" | "found";
  onSubmit: (payload: ReportSubmissionPayload) => void;
}

export interface ReportSubmissionPayload {
  id: string;
  referenceNumber: string;
  name: string;
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
  imageUrl: string;
  status: string;
  type: string;
}
