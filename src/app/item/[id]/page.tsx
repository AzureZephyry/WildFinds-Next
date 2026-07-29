import Link from "next/link";
import ErrorState from "@/components/ErrorState";
import ItemSummary from "@/components/ItemSummary";
import { mockItems } from "@/data/mockItems";
import type { ItemCardItem } from "@/types/items";

interface ItemDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ItemDetailsPage({ params }: ItemDetailsPageProps) {
  const { id } = await params;
  const item = mockItems.find((entry) => entry.id === id) as ItemCardItem | undefined;

  if (!item) {
    return (
      <main className="page-layout">
        <section className="form-panel item-details-panel">
          <ErrorState
            title="Item unavailable"
            message="This item may have been removed or the link may be invalid."
          />
        </section>
      </main>
    );
  }

  const referenceDisplay = item.referenceNumber || item.id;
  const actionLabel = item.type === "found" ? "Claim this item" : "Report if this matches your lost item";
  const actionPath = item.type === "found" ? `/claim/${item.id}` : `/match/${item.id}`;

  return (
    <main className="page-layout">
      <section className="form-panel item-details-panel">
        <div className="page-heading">
          <p className="eyebrow">Item details</p>
          <h1>{item.name}</h1>
          <span className="detail-badge">{item.type}</span>
          <p className="site-note">
            Review the full item details below and use the navigation menu to return to other pages.
          </p>
        </div>

        <ItemSummary item={item} />

        <div className="detail-action">
          <Link href={actionPath} className="primary-button item-action-button">
            {actionLabel}
          </Link>
          <Link href="/" className="secondary-link">
            Back to items
          </Link>
        </div>
      </section>
    </main>
  );
}
