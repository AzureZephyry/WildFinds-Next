import ItemImage from "@/components/ItemImage";
import ReferenceBadge from "@/components/ReferenceBadge";
import type { MyReportItem } from "@/types/myReports";

const ITEM_STATUS_LABELS: Record<string, string> = {
  submitted: "Submitted",
  active: "Active",
  matched: "Matched",
  claimed: "Claimed",
  closed: "Closed",
};

const REVIEW_STATUS_LABELS: Record<string, string> = {
  pending: "Pending Review",
  approved: "Approved",
  rejected: "Rejected",
};

function formatStatus(status: string, labels: Record<string, string>) {
  return labels[status] ?? status;
}

function formatDate(value: string) {
  if (!value) {
    return "Unknown date";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

export default function MyReportCard({ report }: { report: MyReportItem }) {
  return (
    <article className="item-card">
      <ItemImage imageUrl={report.imageUrl} />
      <div className="item-card__body">
        <div className="item-card__header">
          <span className="item-type-badge">{report.type}</span>
          <h2 className="item-card__title">{report.name}</h2>
        </div>

        <div className="item-card__meta">
          <div>
            <strong>Reference No.</strong>
            <ReferenceBadge referenceNumber={report.referenceNumber || report.itemId} />
          </div>
          <div>
            <strong>Category</strong>
            <span>{report.category}</span>
          </div>
          <div>
            <strong>Location</strong>
            <span>{report.building ? `${report.building} · ${report.location}` : report.location}</span>
          </div>
          <div>
            <strong>Date Reported</strong>
            <span>{formatDate(report.dateReported)}</span>
          </div>
          <div>
            <strong>Submitted</strong>
            <span>{formatDate(report.submittedAt)}</span>
          </div>
        </div>

        <div className="item-card__footer">
          <span className="status-pill">Item: {formatStatus(report.itemStatus, ITEM_STATUS_LABELS)}</span>
          <span className="status-pill">Review: {formatStatus(report.reviewStatus, REVIEW_STATUS_LABELS)}</span>
        </div>
      </div>
    </article>
  );
}
