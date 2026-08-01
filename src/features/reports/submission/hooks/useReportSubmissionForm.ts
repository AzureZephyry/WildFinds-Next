import { useCallback, useState } from "react";
import type { ReportFormErrors, ReportFormValues } from "@/features/reports/submission/models/reportFormModels";
import { validateReportForm } from "@/features/reports/submission/validation/validateReportForm";

function createInitialValues(): ReportFormValues {
  return {
    itemName: "",
    reporterName: "",
    category: "ID / Access",
    location: "",
    building: "",
    dateReported: new Date().toISOString().split("T")[0],
    timeReported: new Date().toISOString().slice(11, 16),
    brand: "",
    color: "",
    identifyingMarks: "",
    description: "",
    contactNumber: "",
    email: "",
    imageFile: null,
    imagePreviewUrl: "",
  };
}

export interface UseReportSubmissionFormResult {
  values: ReportFormValues;
  errors: ReportFormErrors;
  selectedImage: File | null;
  updateField: <K extends keyof ReportFormValues>(field: K, value: ReportFormValues[K]) => void;
  setSelectedImage: (file: File | null, previewUrl?: string) => void;
  validate: () => ReportFormErrors;
  reset: () => void;
}

export function useReportSubmissionForm(): UseReportSubmissionFormResult {
  const [values, setValues] = useState<ReportFormValues>(() => createInitialValues());
  const [errors, setErrors] = useState<ReportFormErrors>({});
  const [selectedImage, setSelectedImageState] = useState<File | null>(null);

  const updateField = <K extends keyof ReportFormValues>(field: K, value: ReportFormValues[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const setSelectedImage = (file: File | null, previewUrl?: string) => {
    setSelectedImageState(file);
    setValues((prev) => ({
      ...prev,
      imageFile: file,
      imagePreviewUrl: previewUrl ?? (file ? prev.imagePreviewUrl : ""),
    }));
    setErrors((prev) => ({ ...prev, imageFile: undefined }));
  };

  const validate = () => {
    const validationErrors = validateReportForm(values);
    setErrors(validationErrors);
    return validationErrors;
  };

  const reset = useCallback(() => {
    const initialValues = createInitialValues();
    setValues(initialValues);
    setErrors({});
    setSelectedImageState(initialValues.imageFile ?? null);
  }, []);

  return {
    values,
    errors,
    selectedImage,
    updateField,
    setSelectedImage,
    validate,
    reset,
  };
}
