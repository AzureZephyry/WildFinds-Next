import ItemImage from "@/features/items/shared/components/ItemImage";
import ItemReferenceBadge from "@/features/items/shared/components/ItemReferenceBadge";
import type { ItemCardViewModel } from "@/features/items/browsing/models/itemCardViewModel";
import type { ItemDetailViewModel } from "@/features/items/details/models/itemDetailViewModel";

interface ItemDetailSummaryProps {
  item: ItemDetailViewModel | ItemCardViewModel;
}

export default function ItemDetailSummary({ item }: ItemDetailSummaryProps) {
  const referenceDisplay = item.referenceNumber || item.id;

  return (
    <div className="detail-card">
      <ItemImage imageUrl={item.imageUrl} />
      <div className="detail-grid">
        <div className="detail-row">
          <span className="detail-label">Reference Number</span>
          <ItemReferenceBadge referenceNumber={referenceDisplay} />
        </div>
        <div className="detail-row">
          <span className="detail-label">Category</span>
          <span className="detail-value">{item.category}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Location</span>
          <span className="detail-value">{item.location}</span>
        </div>
        {item.building ? (
          <div className="detail-row">
            <span className="detail-label">Building</span>
            <span className="detail-value">{item.building}</span>
          </div>
        ) : null}
        <div className="detail-row">
          <span className="detail-label">Date reported</span>
          <span className="detail-value">{item.dateReported}</span>
        </div>
        {"timeReported" in item && item.timeReported ? (
          <div className="detail-row">
            <span className="detail-label">Time reported</span>
            <span className="detail-value">{item.timeReported}</span>
          </div>
        ) : null}
        {item.brand ? (
          <div className="detail-row">
            <span className="detail-label">Brand</span>
            <span className="detail-value">{item.brand}</span>
          </div>
        ) : null}
        {item.color ? (
          <div className="detail-row">
            <span className="detail-label">Color</span>
            <span className="detail-value">{item.color}</span>
          </div>
        ) : null}
        {item.identifyingMarks ? (
          <div className="detail-row">
            <span className="detail-label">Identifying marks</span>
            <span className="detail-value">{item.identifyingMarks}</span>
          </div>
        ) : null}
        <div className="detail-row">
          <span className="detail-label">Status</span>
          <span className="detail-value item-details-status">{item.status}</span>
        </div>
        {item.description ? (
          <div className="detail-row">
            <span className="detail-label">Description</span>
            <span className="detail-value">{item.description}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
