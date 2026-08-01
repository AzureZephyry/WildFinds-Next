import Link from "next/link";

interface ReportSubmissionResultProps {
  referenceNumber: string;
  status: string;
  nextStep: string;
}

export default function ReportSubmissionResult({ referenceNumber, status, nextStep }: ReportSubmissionResultProps) {
  return (
    <section className="section-panel" aria-live="polite">
      <div className="detail-grid">
        <div className="detail-row">
          <span className="detail-label">Reference number</span>
          <span className="detail-value">{referenceNumber}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Status</span>
          <span className="detail-value">{status}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Next step</span>
          <span className="detail-value">{nextStep}</span>
        </div>
      </div>
      <div className="detail-action" style={{ marginTop: 20 }}>
        <Link href="/" className="secondary-link">
          Browse reports
        </Link>
      </div>
    </section>
  );
}
