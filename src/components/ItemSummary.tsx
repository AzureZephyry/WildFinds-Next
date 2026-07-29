import ItemImage from "@/components/ItemImage";
import ReferenceBadge from "@/components/ReferenceBadge";
import type { ItemCardItem } from "@/types/items";

interface ItemSummaryProps {
  item: ItemCardItem;
}

export default function ItemSummary({ item }: ItemSummaryProps) {
  const referenceDisplay = item.referenceNumber || item.id;

  return (
    <div className="detail-card">
      <ItemImage imageUrl={item.imageUrl} />
      <div className="detail-grid">
        <div className="detail-row">
          <span className="detail-label">Reference Number</span>
          <ReferenceBadge referenceNumber={referenceDisplay} />
        </div>
        <div className="detail-row">
          <span className="detail-label">Category</span>
          <span className="detail-value">{item.category}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Location</span>
          <span className="detail-value">{item.location}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Building</span>
          <span className="detail-value">{item.building || "N/A"}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Date reported</span>
          <span className="detail-value">{item.dateReported}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Brand</span>
          <span className="detail-value">{item.brand || "Unknown"}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Color</span>
          <span className="detail-value">{item.color || "Unknown"}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Identifying marks</span>
          <span className="detail-value">{item.identifyingMarks || "None"}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Status</span>
          <span className="detail-value item-details-status">{item.status}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Description</span>
          <span className="detail-value">{item.description || "No additional details provided."}</span>
        </div>
      </div>
    </div>
  );
}
