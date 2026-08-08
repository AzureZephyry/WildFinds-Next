"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/core/authentication/components/AuthenticationProvider";
import FormField from "@/components/FormField";

interface FormValues {
  fullName: string;
  emailAddress: string;
  contactNumber: string;
  ownershipExplanation: string;
  verificationDetails: string;
  approximateDateLost: string;
  approximateLocationLost: string;
  additionalNotes: string;
  declarationAccepted: boolean;
}

function getSessionPrefill(session: { user: { email?: string; user_metadata?: Record<string, unknown> } } | null) {
  if (!session) {
    return {
      fullName: "",
      emailAddress: "",
      contactNumber: "",
    };
  }

  const metadata = session.user.user_metadata ?? {};
  const fullName =
    typeof metadata.full_name === "string" && metadata.full_name.trim()
      ? metadata.full_name
      : typeof metadata.name === "string" && metadata.name.trim()
      ? metadata.name
      : "";

  const emailAddress =
    typeof session.user.email === "string" && session.user.email.trim()
      ? session.user.email
      : "";

  const contactNumber =
    typeof metadata.phone === "string" && metadata.phone.trim()
      ? metadata.phone
      : "";

  return { fullName, emailAddress, contactNumber };
}

interface FormErrors {
  fullName?: string;
  emailAddress?: string;
  contactNumber?: string;
  ownershipExplanation?: string;
  verificationDetails?: string;
  declarationAccepted?: string;
}

const MAX_CHARACTERS = 1000;

import { useRouter } from "next/navigation";
import { submitClaim } from "@/features/claims/submission/workflows/submitClaim";
import type { ClaimSubmissionContext } from "@/features/claims/submission/models/claimSubmissionContext";

export default function ClaimSubmissionForm({ context }: { context: ClaimSubmissionContext }) {
  const { session } = useAuth();
  const prefill = useMemo(() => getSessionPrefill(session), [session]);
  const [values, setValues] = useState<FormValues>({
    fullName: prefill.fullName,
    emailAddress: prefill.emailAddress,
    contactNumber: prefill.contactNumber,
    ownershipExplanation: "",
    verificationDetails: "",
    approximateDateLost: "",
    approximateLocationLost: "",
    additionalNotes: "",
    declarationAccepted: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!values.fullName.trim()) {
      nextErrors.fullName = "Enter your full name.";
    }

    if (!values.emailAddress.trim()) {
      nextErrors.emailAddress = "Enter your email address.";
    }

    if (!values.contactNumber.trim()) {
      nextErrors.contactNumber = "Enter a contact number.";
    }

    if (!values.ownershipExplanation.trim()) {
      nextErrors.ownershipExplanation = "Describe how you know this item belongs to you.";
    } else if (values.ownershipExplanation.length > MAX_CHARACTERS) {
      nextErrors.ownershipExplanation = `Keep your explanation under ${MAX_CHARACTERS} characters.`;
    }

    if (!values.verificationDetails.trim()) {
      nextErrors.verificationDetails = "Describe specific verification details.";
    } else if (values.verificationDetails.length > MAX_CHARACTERS) {
      nextErrors.verificationDetails = `Keep your verification details under ${MAX_CHARACTERS} characters.`;
    }

    if (!values.declarationAccepted) {
      nextErrors.declarationAccepted = "You must certify the declaration before submitting.";
    }

    return nextErrors;
  };

  const isFormDisabled = submitted;

  const handleChange = (field: keyof FormValues, value: string | boolean) => {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isFormDisabled || isSubmitting) {
      return;
    }

    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    (async () => {
      try {
        const result = await submitClaim({
          itemId: context.itemId,
          sourceReportId: context.sourceReportId,
          claimantName: values.fullName,
          contactInfo: values.contactNumber,
          ownershipExplanation: values.ownershipExplanation,
          verificationDetails: values.verificationDetails,
          approximateDateLost: values.approximateDateLost || null,
          approximateLocationLost: values.approximateLocationLost || null,
          additionalNotes: values.additionalNotes || null,
        });

        setSubmitted(true);
        // Navigate to success page with reference and meta
        const params = new URLSearchParams();
        params.set("ref", result.referenceNumber);
        params.set("status", result.status);
        params.set("date", new Date(result.createdAt).toISOString());

        router.push(`/item/${context.itemId}/claim/success?${params.toString()}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to submit claim.";
        setSubmitError(message);
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  const ownershipCharacters = values.ownershipExplanation.length;
  const verificationCharacters = values.verificationDetails.length;

  return (
    <section className="report-panel" style={{ display: "grid", gap: 24 }}>
      <div className="report-panel">
        <div className="page-heading">
          <p className="eyebrow">Claim this Item</p>
          <h2>Provide information for ownership verification</h2>
          <p className="site-note" style={{ marginTop: 8 }}>
            Provide information that will help the Lost & Found Office verify ownership.
          </p>
        </div>

        <form className="report-form" onSubmit={handleSubmit} noValidate>
          <div className="detail-card" style={{ padding: 24 }}>
            <div style={{ display: "grid", gap: 20 }}>
              <div>
                <p className="section-label" style={{ marginBottom: 10, fontWeight: 700 }}>Claimant Information</p>
                <p className="site-note" style={{ margin: 0, color: "var(--text-secondary)" }}>
                  Use the contact details the Lost & Found Office can use to reach you.
                </p>
              </div>

              <FormField label="Full Name" htmlFor="fullName">
                <input
                  id="fullName"
                  type="text"
                  value={values.fullName}
                  onChange={(event) => handleChange("fullName", event.target.value)}
                  placeholder="e.g. Juan dela Cruz"
                  autoComplete="name"
                  disabled={isFormDisabled}
                  aria-invalid={Boolean(errors.fullName)}
                  aria-describedby={errors.fullName ? "fullName-error" : undefined}
                  required
                />
                {errors.fullName ? (
                  <p className="validation-message" id="fullName-error">
                    {errors.fullName}
                  </p>
                ) : null}
              </FormField>

              <FormField label="Email Address" htmlFor="emailAddress">
                <input
                  id="emailAddress"
                  type="email"
                  value={values.emailAddress}
                  onChange={(event) => handleChange("emailAddress", event.target.value)}
                  placeholder="e.g. juan@cit.edu.ph"
                  autoComplete="email"
                  disabled={isFormDisabled}
                  aria-invalid={Boolean(errors.emailAddress)}
                  aria-describedby={errors.emailAddress ? "emailAddress-error" : undefined}
                  required
                />
                {errors.emailAddress ? (
                  <p className="validation-message" id="emailAddress-error">
                    {errors.emailAddress}
                  </p>
                ) : null}
              </FormField>

              <FormField label="Contact Number" htmlFor="contactNumber">
                <input
                  id="contactNumber"
                  type="tel"
                  value={values.contactNumber}
                  onChange={(event) => handleChange("contactNumber", event.target.value)}
                  placeholder="e.g. 0917 123 4567"
                  autoComplete="tel"
                  disabled={isFormDisabled}
                  aria-invalid={Boolean(errors.contactNumber)}
                  aria-describedby={errors.contactNumber ? "contactNumber-error" : undefined}
                  required
                />
                {errors.contactNumber ? (
                  <p className="validation-message" id="contactNumber-error">
                    {errors.contactNumber}
                  </p>
                ) : null}
              </FormField>
            </div>
          </div>

          <div className="detail-card" style={{ padding: 24 }}>
            <div style={{ display: "grid", gap: 20 }}>
              <div>
                <p className="section-label" style={{ marginBottom: 10, fontWeight: 700 }}>Ownership Explanation</p>
                <p className="site-note" style={{ margin: 0, color: "var(--text-secondary)" }}>
                  Describe anything that helps establish ownership. Avoid including passwords or other highly sensitive information.
                </p>
              </div>

              <FormField label="Explain how you know this item belongs to you" htmlFor="ownershipExplanation">
                <textarea
                  id="ownershipExplanation"
                  rows={6}
                  value={values.ownershipExplanation}
                  onChange={(event) => handleChange("ownershipExplanation", event.target.value)}
                  placeholder="I lost this item near the Engineering Building. It has..."
                  disabled={isFormDisabled}
                  aria-invalid={Boolean(errors.ownershipExplanation)}
                  aria-describedby={errors.ownershipExplanation ? "ownershipExplanation-error" : "ownershipExplanation-help"}
                  required
                />
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                  {errors.ownershipExplanation ? (
                    <p className="validation-message" id="ownershipExplanation-error">
                      {errors.ownershipExplanation}
                    </p>
                  ) : (
                    <p className="site-note" id="ownershipExplanation-help" style={{ margin: 0 }}>
                      Up to {MAX_CHARACTERS} characters.
                    </p>
                  )}
                  <p className="text-muted" style={{ margin: 0, fontSize: "0.9rem" }}>
                    {ownershipCharacters}/{MAX_CHARACTERS}
                  </p>
                </div>
              </FormField>
            </div>
          </div>

          <div className="detail-card" style={{ padding: 24 }}>
            <div style={{ display: "grid", gap: 20 }}>
              <div>
                <p className="section-label" style={{ marginBottom: 10, fontWeight: 700 }}>Verification Details</p>
                <p className="site-note" style={{ margin: 0, color: "var(--text-secondary)" }}>
                  Describe characteristics that only the owner would know.
                </p>
              </div>

              <ul className="site-note" style={{ margin: "0 0 0 1rem", padding: 0, listStyle: "disc", color: "var(--text-secondary)" }}>
                <li>Stickers</li>
                <li>Scratches</li>
                <li>Protective case</li>
                <li>Lock screen wallpaper</li>
                <li>Accessories</li>
                <li>Contents</li>
                <li>Other unique characteristics</li>
              </ul>

              <FormField label="Verification details" htmlFor="verificationDetails">
                <textarea
                  id="verificationDetails"
                  rows={6}
                  value={values.verificationDetails}
                  onChange={(event) => handleChange("verificationDetails", event.target.value)}
                  placeholder="I also recognize the phone because..."
                  disabled={isFormDisabled}
                  aria-invalid={Boolean(errors.verificationDetails)}
                  aria-describedby={errors.verificationDetails ? "verificationDetails-error" : "verificationDetails-help"}
                  required
                />
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                  {errors.verificationDetails ? (
                    <p className="validation-message" id="verificationDetails-error">
                      {errors.verificationDetails}
                    </p>
                  ) : (
                    <p className="site-note" id="verificationDetails-help" style={{ margin: 0 }}>
                      Up to {MAX_CHARACTERS} characters.
                    </p>
                  )}
                  <p className="text-muted" style={{ margin: 0, fontSize: "0.9rem" }}>
                    {verificationCharacters}/{MAX_CHARACTERS}
                  </p>
                </div>
              </FormField>
            </div>
          </div>

          <div className="detail-card" style={{ padding: 24 }}>
            <div style={{ display: "grid", gap: 20 }}>
              <div>
                <p className="section-label" style={{ marginBottom: 10, fontWeight: 700 }}>Additional Information (optional)</p>
                <p className="site-note" style={{ margin: 0, color: "var(--text-secondary)" }}>
                  Provide any extra details that may help with verification.
                </p>
              </div>

              <FormField label="Approximate Date Lost" htmlFor="approximateDateLost">
                <input
                  id="approximateDateLost"
                  type="text"
                  value={values.approximateDateLost}
                  onChange={(event) => handleChange("approximateDateLost", event.target.value)}
                  placeholder="e.g. January 2026"
                  disabled={isFormDisabled}
                  aria-describedby="approximateDateLost-help"
                />
                <p className="site-note" id="approximateDateLost-help" style={{ margin: 0 }}>
                  Optional.
                </p>
              </FormField>

              <FormField label="Approximate Location Lost" htmlFor="approximateLocationLost">
                <input
                  id="approximateLocationLost"
                  type="text"
                  value={values.approximateLocationLost}
                  onChange={(event) => handleChange("approximateLocationLost", event.target.value)}
                  placeholder="e.g. Near the Engineering Building"
                  disabled={isFormDisabled}
                  aria-describedby="approximateLocationLost-help"
                />
                <p className="site-note" id="approximateLocationLost-help" style={{ margin: 0 }}>
                  Optional.
                </p>
              </FormField>

              <FormField label="Additional Notes" htmlFor="additionalNotes">
                <textarea
                  id="additionalNotes"
                  rows={4}
                  value={values.additionalNotes}
                  onChange={(event) => handleChange("additionalNotes", event.target.value)}
                  placeholder="Add any other relevant details."
                  disabled={isFormDisabled}
                  aria-describedby="additionalNotes-help"
                />
                <p className="site-note" id="additionalNotes-help" style={{ margin: 0 }}>
                  Optional.
                </p>
              </FormField>
            </div>
          </div>

          <div className="detail-card" style={{ padding: 24 }}>
            <div style={{ display: "grid", gap: 16 }}>
              <div>
                <label htmlFor="declarationAccepted" style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: isFormDisabled ? "default" : "pointer" }}>
                  <input
                    id="declarationAccepted"
                    type="checkbox"
                    checked={values.declarationAccepted}
                    onChange={(event) => handleChange("declarationAccepted", event.target.checked)}
                    disabled={isFormDisabled}
                    aria-invalid={Boolean(errors.declarationAccepted)}
                    aria-describedby={errors.declarationAccepted ? "declarationAccepted-error" : undefined}
                  />
                  <span>
                    I certify that the information I provided is accurate to the best of my knowledge. I understand that submitting false claims may result in rejection and may be referred to the appropriate university office.
                  </span>
                </label>
                {errors.declarationAccepted ? (
                  <p className="validation-message" id="declarationAccepted-error">
                    {errors.declarationAccepted}
                  </p>
                ) : null}
              </div>

              <div style={{ display: "grid", gap: 10 }}>
                <button type="submit" className="primary-button" disabled={isFormDisabled || isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Claim"}
                </button>
                {submitError ? (
                  <p className="validation-message" role="alert" style={{ margin: 0 }}>{submitError}</p>
                ) : null}
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
