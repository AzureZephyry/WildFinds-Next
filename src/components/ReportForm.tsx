"use client";

import { useMemo, useState } from 'react';
import FormField from './FormField';
import ImageUploader from './ImageUploader';
import ValidationMessage from './ValidationMessage';
import { BUILDING_OPTIONS } from '../data/buildingOptions';
import { getItemCategories } from '../utils/reportUtils';
import { validateReport } from '../utils/validation';
import type { ReportFormErrors, ReportFormProps, ReportFormValues, ReportSubmissionPayload } from '../types/reports';
import { getSupabaseClient } from '../lib/supabase/client';
import { generateReferenceNumber } from '../utils/referenceGenerator';

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

export default function ReportForm({ reportType, onSubmit }: ReportFormProps) {
  const [values, setValues] = useState<ReportFormValues>(INITIAL_STATE);
  const [errors, setErrors] = useState<ReportFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmitTime, setLastSubmitTime] = useState(0);

  const setField = (name: keyof ReportFormValues, value: string | File | null) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

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

    setIsSubmitting(true);
    setErrors((prev) => ({ ...prev, form: undefined }));

    try {
      const client = getSupabaseClient();

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
          throw new Error(uploadError.message || 'Image upload failed.');
        }

        const { data: publicUrlData } = client.storage.from('item-images').getPublicUrl(safeFileName);
        imageUrl = publicUrlData.publicUrl || null;
      }

      let referenceNumber = generateReferenceNumber(reportType, values.dateReported, []);
      let itemId: string | null = null;
      let itemError: Error | null = null;

      for (let attempt = 0; attempt < 3; attempt += 1) {
        const { data, error } = await client
          .from('items')
          .insert({
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
          })
          .select('id')
          .single<{ id: string }>();

        if (!error && data) {
          itemId = data.id;
          break;
        }

        if (error?.code === '23505' && error.message.includes('reference_number')) {
          referenceNumber = generateReferenceNumber(reportType, values.dateReported, [referenceNumber]);
          continue;
        }

        itemError = new Error(error?.message || 'Unable to create item record.');
        break;
      }

      if (!itemId) {
        throw itemError || new Error('Unable to create item record.');
      }

      const { error: reportError } = await client.from('reports').insert({
        item_id: itemId,
        reporter_name: values.reporterName,
        email: values.email,
        contact_number: values.contactNumber,
      });

      if (reportError) {
        throw new Error(reportError.message || 'Unable to save report.');
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
        <button type="submit" className="primary-button" disabled={isSubmitting}>
          Submit Report
        </button>
      </div>
    </form>
  );
}
