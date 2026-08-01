"use client";

import Link from "next/link";
import { useState } from "react";
import FormField from "@/components/FormField";
import type { ItemCardViewModel } from "@/features/items/browsing/models/itemCardViewModel";

interface ClaimMatchFormProps {
  item: ItemCardViewModel;
  eyebrow: string;
  heading: string;
  description: string;
  nameLabel: string;
  contactLabel: string;
  detailLabel: string;
  detailId: "proofDetails" | "matchDetails";
  detailPlaceholder?: string;
  submitLabel: string;
  validationMessage: string;
  successTitle: string;
  successMessage: string;
}

export default function ClaimMatchForm({
  item,
  eyebrow,
  heading,
  description,
  nameLabel,
  contactLabel,
  detailLabel,
  detailId,
  detailPlaceholder,
  submitLabel,
  validationMessage,
  successTitle,
  successMessage,
}: ClaimMatchFormProps) {
  const [claimantName, setClaimantName] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [details, setDetails] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!claimantName.trim() || !contactInfo.trim() || !details.trim()) {
      setErrorMessage(validationMessage);
      return;
    }

    setErrorMessage("");
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="section-panel" aria-live="polite">
        <div className="detail-grid">
          <div className="detail-row">
            <span className="detail-label">Status</span>
            <span className="detail-value">{item.status}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Result</span>
            <span className="detail-value">{successTitle}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Next step</span>
            <span className="detail-value">{successMessage}</span>
          </div>
        </div>
        <div className="detail-action" style={{ marginTop: 20 }}>
          <Link href="/" className="secondary-link">
            Back to items
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="report-panel">
      <div className="page-heading">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{heading}</h1>
        <p className="site-note">{description}</p>
      </div>

      <form className="report-form" onSubmit={handleSubmit}>
        <FormField label={nameLabel} htmlFor="claimantName">
          <input
            id="claimantName"
            type="text"
            value={claimantName}
            onChange={(event) => setClaimantName(event.target.value)}
            required
          />
        </FormField>

        <FormField label={contactLabel} htmlFor="contactInfo">
          <input
            id="contactInfo"
            type="text"
            value={contactInfo}
            onChange={(event) => setContactInfo(event.target.value)}
            required
          />
        </FormField>

        <FormField label={detailLabel} htmlFor={detailId}>
          <textarea
            id={detailId}
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            placeholder={detailPlaceholder}
            required
          />
        </FormField>

        {errorMessage ? <p className="validation-message">{errorMessage}</p> : null}

        <button type="submit" className="primary-button">
          {submitLabel}
        </button>
      </form>
    </div>
  );
}
