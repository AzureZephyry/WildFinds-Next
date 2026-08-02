import Link from "next/link";
import ItemImage from "@/features/items/shared/components/ItemImage";
import ItemReferenceBadge from "@/features/items/shared/components/ItemReferenceBadge";
import type { ItemCardViewModel } from "@/features/items/browsing/models/itemCardViewModel";

interface ItemCardProps {
  item: ItemCardViewModel;
}

export default function ItemCard({ item }: ItemCardProps) {
  const referenceDisplay = item.referenceNumber || item.id;

  return (
    <article className="item-card">
      <ItemImage imageUrl={item.imageUrl} />
      <div className="item-card__body">
        <div className="item-card__header">
          <span className="item-type-badge">{item.type}</span>
          <h3 className="item-card__title">{item.name}</h3>
        </div>

        <div className="item-card__meta">
          <div>
            <strong>Reference No.</strong>
            <ItemReferenceBadge referenceNumber={referenceDisplay} />
          </div>
          <div>
            <strong>Category</strong>
            <span>{item.category}</span>
          </div>
          <div>
            <strong>Location</strong>
            <span>{item.location}</span>
          </div>
          <div>
            <strong>Date Reported</strong>
            <span>{item.dateReported}</span>
          </div>
        </div>

        <div className="item-card__footer">
          <span className="status-pill">{item.status}</span>
          <Link className="view-details" href={`/item/${item.id}`}>
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}
