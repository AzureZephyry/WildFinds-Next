"use client";

import type { ItemType } from "@/features/items/shared/models/itemType";
import ReportSubmissionForm from "@/features/reports/submission/components/ReportSubmissionForm";

interface ReportSubmissionScreenProps {
  reportType: ItemType;
  heading: string;
  description: string;
  successExplanation?: string;
}

export default function ReportSubmissionScreen({
  reportType,
  heading,
  description,
  successExplanation,
}: ReportSubmissionScreenProps) {
  return (
    <main className="page-layout">
      <div className="report-panel">
        <section className="page-heading">
          <p className="eyebrow">{reportType === "lost" ? "Report a lost item" : "Report a found item"}</p>
          <h1>{heading}</h1>
          <p className="site-note">{description}</p>
        </section>

        <section className="form-panel">
          <ReportSubmissionForm
            reportType={reportType}
            onSubmit={() => undefined}
            successExplanation={successExplanation}
          />
        </section>
      </div>
    </main>
  );
}
