"use client";

import Link from 'next/link';
import { useState } from 'react';
import ReportForm from '../../../components/ReportForm';
import type { ReportSubmissionPayload } from '../../../types/reports';

export default function ReportFoundPage() {
  const [submitted, setSubmitted] = useState<ReportSubmissionPayload | null>(null);

  return (
    <main className="page-layout">
      <div className="report-panel">
        <section className="page-heading">
          <p className="eyebrow">Report a found item</p>
          <h1>Share the details of an item you found on campus</h1>
          <p className="site-note">
            Submit a report so the owner can recognize and claim it quickly.
          </p>
        </section>

        <section className="form-panel">
          <ReportForm
            reportType="found"
            onSubmit={(payload) => {
              setSubmitted(payload);
            }}
          />
        </section>

        {submitted && (
          <section className="section-panel" aria-live="polite">
            <div className="detail-grid">
              <div className="detail-row">
                <span className="detail-label">Reference number</span>
                <span className="detail-value">{submitted.referenceNumber}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status</span>
                <span className="detail-value">{submitted.status}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Next step</span>
                <span className="detail-value">
                  Your report will appear in the listings so it can be matched with a lost-item report.
                </span>
              </div>
            </div>
            <div className="detail-action" style={{ marginTop: 20 }}>
              <Link href="/" className="secondary-link">
                Browse reports
              </Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
