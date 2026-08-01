"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/core/authentication/components/AuthenticationProvider";
import { getCurrentProfileId } from "@/infrastructure/supabase/authentication/supabaseAuthentication";
import { supabase } from "@/infrastructure/supabase/clients/browserSupabaseClient";
import FormField from "@/components/FormField";
import ReportImageUploader from "@/features/reports/submission/components/ReportImageUploader";
import ReportSubmissionResult from "@/features/reports/submission/components/ReportSubmissionResult";
import ReportValidationMessage from "@/features/reports/submission/components/ReportValidationMessage";
import { reportBuildingOptions } from "@/features/reports/submission/configuration/reportBuildingOptions";
import { reportCategoryOptions } from "@/features/reports/submission/configuration/reportCategoryOptions";
import { createOwnedReport } from "@/features/reports/submission/commands/createOwnedReport";
import { createReportedItem } from "@/features/reports/submission/commands/createReportedItem";
import { useReportSubmissionForm } from "@/features/reports/submission/hooks/useReportSubmissionForm";
import type { ReportFormProps } from "@/features/reports/submission/models/reportFormModels";
import type { ReportSubmissionPayload } from "@/features/reports/submission/models/reportSubmissionModels";
import { findCreatedReportedItem } from "@/features/reports/submission/queries/findCreatedReportedItem";
import { generateReportReferenceNumber } from "@/features/reports/submission/reference/generateReportReferenceNumber";
import { uploadReportImage } from "@/features/reports/submission/storage/uploadReportImage";

type SubmissionStep =
  | "auth-session"
  | "profile-lookup"
  | "image-upload"
  | "reference-generation"
  | "item-insert"
  | "item-fetch"
  | "report-insert"
  | "unexpected";

function logSubmissionError(step: SubmissionStep, error: unknown) {
  const maybeError = typeof error === "object" && error !== null
    ? error as { code?: unknown; message?: unknown; details?: unknown; hint?: unknown; status?: unknown }
    : {};

  console.error("[WildFinds] Report submission failed", {
    step,
    code: maybeError.code,
    message: maybeError.message,
    details: maybeError.details,
    hint: maybeError.hint,
    status: maybeError.status,
    fullError: error,
  });
}

export default function ReportSubmissionForm({ reportType, onSubmit, successExplanation }: ReportFormProps) {
  const router = useRouter();
  const { session, isLoading: isAuthLoading } = useAuth();
  const { values, errors, selectedImage, updateField, setSelectedImage, validate, reset } = useReportSubmissionForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | undefined>(undefined);
  const [lastSubmitTime, setLastSubmitTime] = useState(0);
  const [submittedPayload, setSubmittedPayload] = useState<ReportSubmissionPayload | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!session) {
      const timer = window.setTimeout(() => {
        reset();
        setIsSubmitting(false);
        setAuthMessage("Please log in to submit a report.");
      }, 0);
      router.replace(`/login?redirect=/report/${reportType}`);

      return () => window.clearTimeout(timer);
    }
  }, [isAuthLoading, reportType, reset, router, session]);

  const handleImageChange = (file: File | null) => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    if (!file) {
      setSelectedImage(null, "");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    previewUrlRef.current = objectUrl;
    setSelectedImage(file, objectUrl);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (Date.now() - lastSubmitTime < 1200) {
      return;
    }

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    if (isAuthLoading) {
      setSubmissionError("Please wait while we verify your account.");
      return;
    }

    if (!session) {
      setAuthMessage("Please log in to submit a report.");
      router.replace(`/login?redirect=/report/${reportType}`);
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(undefined);

    let step: SubmissionStep = "unexpected";

    try {
      const client = supabase;

      if (!client) {
        throw new Error("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      }

      step = "auth-session";
      const {
        data: { session: currentSession },
        error: sessionError,
      } = await client.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!currentSession) {
        setAuthMessage("Your session has ended. Please log in again before submitting.");
        router.replace(`/login?redirect=/report/${reportType}`);
        throw new Error("Authentication is required to submit a report.");
      }

      step = "profile-lookup";
      const profileId = await getCurrentProfileId();

      if (!profileId) {
        setAuthMessage("Your account profile could not be found. Please sign in again and try submitting the report.");
        router.replace(`/login?redirect=/report/${reportType}`);
        throw new Error("Your account profile could not be found.");
      }

      let imageUrl: string | null = null;

      if (values.imageFile) {
        step = "image-upload";
        imageUrl = await uploadReportImage(client, values.imageFile);
      }

      let referenceNumber: string | null = null;
      let itemId: string | null = null;

      for (let attempt = 0; attempt < 3; attempt += 1) {
        step = "reference-generation";
        referenceNumber = await generateReportReferenceNumber(client, reportType, values.dateReported);

        step = "item-insert";
        try {
          await createReportedItem(client, {
            referenceNumber,
            reportType,
            itemName: values.itemName,
            category: values.category,
            description: values.description,
            brand: values.brand,
            color: values.color,
            identifyingMarks: values.identifyingMarks,
            building: values.building,
            location: values.location,
            dateReported: values.dateReported,
            timeReported: values.timeReported,
            imageUrl,
          });
        } catch (error) {
          if (error instanceof Error && error.message === "RETRY_REFERENCE_NUMBER") {
            continue;
          }
          throw error;
        }

        step = "item-fetch";
        const createdItem = await findCreatedReportedItem(client, { referenceNumber });
        itemId = createdItem.id;
        break;
      }

      if (!referenceNumber || !itemId) {
        throw new Error("Unable to create item record.");
      }

      step = "report-insert";
      console.log("[WildFinds] Report ownership insert", {
        itemId,
        profileId,
        sessionUserId: currentSession.user.id,
      });

      await createOwnedReport(client, {
        itemId,
        profileId,
        reporterName: values.reporterName,
        email: values.email,
        contactNumber: values.contactNumber,
      });

      const payload: ReportSubmissionPayload = {
        id: itemId,
        referenceNumber,
        name: values.itemName,
        category: values.category,
        location: values.location,
        building: values.building,
        dateReported: values.dateReported,
        timeReported: values.timeReported,
        brand: values.brand,
        color: values.color,
        identifyingMarks: values.identifyingMarks,
        description: values.description,
        contactNumber: values.contactNumber,
        email: values.email,
        imageUrl: imageUrl || "",
        status: "submitted",
        type: reportType,
      };

      onSubmit(payload);
      setLastSubmitTime(Date.now());
      setSubmittedPayload(payload);
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
      reset();
      setAuthMessage(null);
    } catch (error) {
      logSubmissionError(step, error);
      setSubmissionError("Unable to save your report right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = useMemo(() => reportCategoryOptions, []);

  if (isAuthLoading) {
    return <div className="section-panel" aria-live="polite">Checking your account...</div>;
  }

  if (!session) {
    return (
      <div className="section-panel" aria-live="polite">
        <p className="validation-message">{authMessage || "Please log in to submit a report."}</p>
      </div>
    );
  }

  if (submittedPayload) {
    return (
      <div>
        <ReportSubmissionResult
          referenceNumber={submittedPayload.referenceNumber}
          status={submittedPayload.status}
          nextStep={successExplanation || "Keep an eye on your report and check the home page for matching submissions."}
        />
      </div>
    );
  }

  return (
    <form className="report-form" onSubmit={handleSubmit}>
      {authMessage ? <p className="validation-message">{authMessage}</p> : null}
      <div className="form-grid">
        <FormField label="Item name" htmlFor="itemName">
          <input
            id="itemName"
            type="text"
            value={values.itemName}
            onChange={(e) => updateField("itemName", e.target.value)}
            placeholder="e.g. Student ID card"
            maxLength={80}
            required
          />
          <ReportValidationMessage message={errors.itemName} />
        </FormField>

        <FormField label="Reporter name" htmlFor="reporterName">
          <input
            id="reporterName"
            type="text"
            value={values.reporterName}
            onChange={(e) => updateField("reporterName", e.target.value)}
            placeholder="e.g. Maria Santos"
            maxLength={80}
            required
          />
          <ReportValidationMessage message={errors.reporterName} />
        </FormField>

        <FormField label="Category" htmlFor="category">
          <select
            id="category"
            value={values.category}
            onChange={(e) => updateField("category", e.target.value)}
            required
          >
            {categories.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <ReportValidationMessage message={errors.category} />
        </FormField>

        <FormField label="Location" htmlFor="location">
          <input
            id="location"
            type="text"
            value={values.location}
            onChange={(e) => updateField("location", e.target.value)}
            placeholder="e.g. Main Library"
            maxLength={80}
            required
          />
          <ReportValidationMessage message={errors.location} />
        </FormField>

        <FormField label="Building" htmlFor="building">
          <select
            id="building"
            value={values.building}
            onChange={(e) => updateField("building", e.target.value)}
            required
          >
            <option value="">Select a building</option>
            {reportBuildingOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <ReportValidationMessage message={errors.building} />
        </FormField>

        <FormField label="Date" htmlFor="dateReported">
          <input
            id="dateReported"
            type="date"
            value={values.dateReported}
            onChange={(e) => updateField("dateReported", e.target.value)}
            required
          />
          <ReportValidationMessage message={errors.dateReported} />
        </FormField>

        <FormField label="Time" htmlFor="timeReported">
          <input
            id="timeReported"
            type="time"
            value={values.timeReported}
            onChange={(e) => updateField("timeReported", e.target.value)}
            required
          />
          <ReportValidationMessage message={errors.timeReported} />
        </FormField>

        <FormField label="Brand" htmlFor="brand">
          <input
            id="brand"
            type="text"
            value={values.brand}
            onChange={(e) => updateField("brand", e.target.value)}
            placeholder="e.g. Samsung"
            maxLength={40}
            required
          />
          <ReportValidationMessage message={errors.brand} />
        </FormField>

        <FormField label="Color" htmlFor="color">
          <input
            id="color"
            type="text"
            value={values.color}
            onChange={(e) => updateField("color", e.target.value)}
            placeholder="e.g. Black"
            maxLength={30}
            required
          />
          <ReportValidationMessage message={errors.color} />
        </FormField>

        <FormField label="Identifying marks" htmlFor="identifyingMarks">
          <textarea
            id="identifyingMarks"
            value={values.identifyingMarks}
            onChange={(e) => updateField("identifyingMarks", e.target.value)}
            placeholder="Describe scratches, labels, or engravings"
            maxLength={120}
          />
          <ReportValidationMessage message={errors.identifyingMarks} />
        </FormField>

        <FormField label="Description" htmlFor="description">
          <textarea
            id="description"
            value={values.description}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder="Add any extra information"
            maxLength={280}
          />
          <ReportValidationMessage message={errors.description} />
        </FormField>
      </div>

      <div className="form-grid form-grid--wide">
        <FormField label="Contact number" htmlFor="contactNumber">
          <input
            id="contactNumber"
            type="tel"
            value={values.contactNumber}
            onChange={(e) => updateField("contactNumber", e.target.value)}
            placeholder="e.g. +1234567890"
            required
          />
          <ReportValidationMessage message={errors.contactNumber} />
        </FormField>

        <FormField label="Email" htmlFor="email">
          <input
            id="email"
            type="email"
            value={values.email}
            onChange={(e) => updateField("email", e.target.value)}
            placeholder="e.g. student@example.com"
            required
          />
          <ReportValidationMessage message={errors.email} />
        </FormField>
      </div>

      <ReportImageUploader
        imageFile={selectedImage}
        previewUrl={values.imagePreviewUrl}
        onFileChange={handleImageChange}
        errorMessage={errors.imageFile}
      />

      <div className="form-actions">
        {submissionError ? <p className="validation-message">{submissionError}</p> : null}
        <button type="submit" className="primary-button" disabled={isSubmitting || isAuthLoading}>
          {isSubmitting ? "Submitting..." : "Submit Report"}
        </button>
      </div>
    </form>
  );
}
