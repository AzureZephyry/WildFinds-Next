import type { ItemType } from "@/features/items/shared/models/itemType";
import type { ReportSubmissionPayload } from "@/features/reports/submission/models/reportSubmissionModels";

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
  reportType: ItemType;
  onSubmit: (payload: ReportSubmissionPayload) => void;
  successExplanation?: string;
}
