"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import FormField from './FormField';
import ImageUploader from './ImageUploader';
import ValidationMessage from './ValidationMessage';
import { BUILDING_OPTIONS } from '../data/buildingOptions';
import { getItemCategories } from '../utils/reportUtils';
import { validateReport } from '../utils/validation';
import type { ReportFormErrors, ReportFormProps, ReportFormValues, ReportSubmissionPayload } from '../types/reports';
import { supabase } from '../lib/supabase/client';
import { getCurrentProfileId } from '../lib/supabase/auth';

const INITIAL_STATE: ReportFormValues = {
  itemName: '',
  reporterName: '',
  category: 'ID / Access',
  location: '',
  building: '',
  dateReported: new Date().toISOString().split('T')[0],
  timeReported: new Date().toISOString().slice(11, 16),
  brand: '',
  color: '',
  identifyingMarks: '',
  description: '',
  contactNumber: '',
  email: '',
  imageFile: null,
  imagePreviewUrl: '',
};

function getSupabaseErrorMessage(error: unknown, fallback: string): string {
  if (typeof error !== 'object' || error === null) {
    return fallback;
  }

  const maybeError = error as {
    message?: unknown;
    details?: unknown;
    hint?: unknown;
    code?: unknown;
  };

  const parts = [
    typeof maybeError.message === 'string' ? maybeError.message : undefined,
    typeof maybeError.details === 'string' ? maybeError.details : undefined,
    typeof maybeError.hint === 'string' ? maybeError.hint : undefined,
    typeof maybeError.code === 'string' ? `code: ${maybeError.code}` : undefined,
  ].filter((value): value is string => Boolean(value && value.trim().length > 0));

  return parts.length > 0 ? parts.join(' · ') : fallback;
}

export default function ReportForm({ reportType, onSubmit }: ReportFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<ReportFormValues>(INITIAL_STATE);
  const [errors, setErrors] = useState<ReportFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [lastSubmitTime, setLastSubmitTime] = useState(0);

  const setField = (name: keyof ReportFormValues, value: string | File | null) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  useEffect(() => {
    let active = true;

    const verifyAccess = async () => {
      const profileId = await getCurrentProfileId();

      if (!active) {
        return;
      }

      if (!profileId) {
        setAuthMessage('Please log in to submit a report.');
        router.replace(`/login?redirect=/report/${reportType}`);
        return;
      }

      setAuthMessage(null);
      setIsAuthReady(true);
    };

    void verifyAccess();

    return () => {
      active = false;
    };
  }, [reportType, router]);

  const handleImageChange = (file: File | null) => {
    setField('imageFile', file);
    if (!file) {
      setField('imagePreviewUrl', '');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setField('imagePreviewUrl', String(reader.result || ''));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (Date.now() - lastSubmitTime < 1200) {
      return;
    }

    const validationErrors = validateReport(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    if (!isAuthReady) {
      setErrors((prev) => ({ ...prev, form: 'Please wait while we verify your account.' }));
      return;
    }

    setIsSubmitting(true);
    setErrors((prev) => ({ ...prev, form: undefined }));

    try {
      const client = supabase;

      if (!client) {
        throw new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
      }

      let imageUrl: string | null = null;

      if (values.imageFile) {
        const safeFileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${values.imageFile.name.replace(/\s+/g, '-').toLowerCase()}`;
        const { error: uploadError } = await client.storage.from('item-images').upload(safeFileName, values.imageFile, {
          cacheControl: '3600',
          upsert: false,
        });

        if (uploadError) {
          const uploadMessage = getSupabaseErrorMessage(uploadError, 'Image upload failed.');
          console.error('[WildFinds] Supabase storage upload failed', uploadError);
          throw new Error(`Image upload failed: ${uploadMessage}`);
        }

        const { data: publicUrlData } = client.storage.from('item-images').getPublicUrl(safeFileName);
        imageUrl = publicUrlData.publicUrl || null;
      }

      const profileId = await getCurrentProfileId();

      if (!profileId) {
        setAuthMessage('Your account profile could not be found. Please sign in again and try submitting the report.');
        router.replace(`/login?redirect=/report/${reportType}`);
        throw new Error('Your account profile could not be found. Please sign in again and try submitting the report.');
      }

      let referenceNumber: string | null = null;
      let itemId: string | null = null;

      for (let attempt = 0; attempt < 3; attempt += 1) {
        const { data: generatedReference, error: referenceError } = await client.rpc('generate_reference_number', {
          report_type: reportType,
          report_date: values.dateReported,
        });

        if (referenceError) {
          const referenceMessage = getSupabaseErrorMessage(referenceError, 'Unable to generate reference number.');
          console.error('[WildFinds] Supabase reference generation failed', referenceError);
          throw new Error(`Unable to generate reference number: ${referenceMessage}`);
        }

        if (typeof generatedReference !== 'string' || generatedReference.trim().length === 0) {
          throw new Error('Unable to generate reference number: the database returned an empty value.');
        }

        referenceNumber = generatedReference;

        const { error: itemInsertError } = await client.from('items').insert({
          reference_number: referenceNumber,
          type: reportType,
          name: values.itemName,
          category: values.category,
          description: values.description || null,
          brand: values.brand,
          color: values.color,
          identifying_marks: values.identifyingMarks || null,
          building: values.building,
          location: values.location,
          date_reported: values.dateReported,
          time_reported: values.timeReported,
          image_url: imageUrl,
          status: 'submitted',
        });

        if (itemInsertError) {
          const itemErrorMessage = getSupabaseErrorMessage(itemInsertError, 'Unable to create item record.');
          if (itemInsertError.code === '23505' && itemInsertError.message.includes('reference_number')) {
            continue;
          }

          console.error('[WildFinds] Supabase item insert failed', {
            error: itemInsertError,
            referenceNumber,
            reportType,
            imageUrl,
          });
          throw new Error(`Unable to create item record: ${itemErrorMessage}`);
        }

        const { data: insertedItem, error: itemFetchError } = await client
          .from('items')
          .select('id')
          .eq('reference_number', referenceNumber)
          .maybeSingle<{ id: string }>();

        if (itemFetchError) {
          console.error('[WildFinds] Supabase item fetch after insert failed', {
            error: itemFetchError,
            referenceNumber,
          });
          throw new Error(`Unable to load the created item: ${getSupabaseErrorMessage(itemFetchError, 'Unknown item fetch error.')}`);
        }

        if (!insertedItem?.id) {
          throw new Error(`Unable to load the created item for reference ${referenceNumber}.`);
        }

        itemId = insertedItem.id;
        break;
      }

      if (!referenceNumber || !itemId) {
        throw new Error('Unable to create item record.');
      }

      const { error: reportError } = await client.from('reports').insert({
        item_id: itemId,
        profile_id: profileId,
        reporter_name: values.reporterName,
        email: values.email,
        contact_number: values.contactNumber,
      });

      if (reportError) {
        const reportMessage = getSupabaseErrorMessage(reportError, 'Unable to save report.');
        console.error('[WildFinds] Supabase report insert failed', reportError);
        throw new Error(`Unable to save report: ${reportMessage}`);
      }

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
        imageUrl: imageUrl || '',
        status: 'submitted',
        type: reportType,
      };

      onSubmit(payload);
      setLastSubmitTime(Date.now());
      setValues(INITIAL_STATE);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save report right now.';
      setErrors((prev) => ({ ...prev, form: message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = useMemo(() => getItemCategories(), []);

  return (
    <form className="report-form" onSubmit={handleSubmit}>
      {authMessage ? <p className="validation-message">{authMessage}</p> : null}
      <div className="form-grid">
        <FormField label="Item name" htmlFor="itemName">
          <input
            id="itemName"
            type="text"
            value={values.itemName}
            onChange={(e) => setField('itemName', e.target.value)}
            placeholder="e.g. Student ID card"
            maxLength={80}
            required
          />
          <ValidationMessage message={errors.itemName} />
        </FormField>

        <FormField label="Reporter name" htmlFor="reporterName">
          <input
            id="reporterName"
            type="text"
            value={values.reporterName}
            onChange={(e) => setField('reporterName', e.target.value)}
            placeholder="e.g. Maria Santos"
            maxLength={80}
            required
          />
          <ValidationMessage message={errors.reporterName} />
        </FormField>

        <FormField label="Category" htmlFor="category">
          <select
            id="category"
            value={values.category}
            onChange={(e) => setField('category', e.target.value)}
            required
          >
            {categories.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <ValidationMessage message={errors.category} />
        </FormField>

        <FormField label="Location" htmlFor="location">
          <input
            id="location"
            type="text"
            value={values.location}
            onChange={(e) => setField('location', e.target.value)}
            placeholder="e.g. Main Library"
            maxLength={80}
            required
          />
          <ValidationMessage message={errors.location} />
        </FormField>

        <FormField label="Building" htmlFor="building">
          <select
            id="building"
            value={values.building}
            onChange={(e) => setField('building', e.target.value)}
            required
          >
            <option value="">Select a building</option>
            {BUILDING_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <ValidationMessage message={errors.building} />
        </FormField>

        <FormField label="Date" htmlFor="dateReported">
          <input
            id="dateReported"
            type="date"
            value={values.dateReported}
            onChange={(e) => setField('dateReported', e.target.value)}
            required
          />
          <ValidationMessage message={errors.dateReported} />
        </FormField>

        <FormField label="Time" htmlFor="timeReported">
          <input
            id="timeReported"
            type="time"
            value={values.timeReported}
            onChange={(e) => setField('timeReported', e.target.value)}
            required
          />
          <ValidationMessage message={errors.timeReported} />
        </FormField>

        <FormField label="Brand" htmlFor="brand">
          <input
            id="brand"
            type="text"
            value={values.brand}
            onChange={(e) => setField('brand', e.target.value)}
            placeholder="e.g. Samsung"
            maxLength={40}
            required
          />
          <ValidationMessage message={errors.brand} />
        </FormField>

        <FormField label="Color" htmlFor="color">
          <input
            id="color"
            type="text"
            value={values.color}
            onChange={(e) => setField('color', e.target.value)}
            placeholder="e.g. Black"
            maxLength={30}
            required
          />
          <ValidationMessage message={errors.color} />
        </FormField>

        <FormField label="Identifying marks" htmlFor="identifyingMarks">
          <textarea
            id="identifyingMarks"
            value={values.identifyingMarks}
            onChange={(e) => setField('identifyingMarks', e.target.value)}
            placeholder="Describe scratches, labels, or engravings"
            maxLength={120}
          />
          <ValidationMessage message={errors.identifyingMarks} />
        </FormField>

        <FormField label="Description" htmlFor="description">
          <textarea
            id="description"
            value={values.description}
            onChange={(e) => setField('description', e.target.value)}
            placeholder="Add any extra information"
            maxLength={280}
          />
          <ValidationMessage message={errors.description} />
        </FormField>
      </div>

      <div className="form-grid form-grid--wide">
        <FormField label="Contact number" htmlFor="contactNumber">
          <input
            id="contactNumber"
            type="tel"
            value={values.contactNumber}
            onChange={(e) => setField('contactNumber', e.target.value)}
            placeholder="e.g. +1234567890"
            required
          />
          <ValidationMessage message={errors.contactNumber} />
        </FormField>

        <FormField label="Email" htmlFor="email">
          <input
            id="email"
            type="email"
            value={values.email}
            onChange={(e) => setField('email', e.target.value)}
            placeholder="e.g. student@example.com"
            required
          />
          <ValidationMessage message={errors.email} />
        </FormField>
      </div>

      <ImageUploader
        imageFile={values.imageFile}
        onFileChange={handleImageChange}
        errorMessage={errors.imageFile}
      />

      <div className="form-actions">
        {errors.form ? <p className="validation-message">{errors.form}</p> : null}
        <button type="submit" className="primary-button" disabled={isSubmitting || !isAuthReady}>
          Submit Report
        </button>
      </div>
    </form>
  );
}
