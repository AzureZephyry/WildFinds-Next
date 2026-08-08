"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ErrorState from "@/components/ErrorState";
import ItemDetailSummary from "@/features/items/details/components/ItemDetailSummary";
import { mapItemDetailViewModel } from "@/features/items/details/mappers/mapItemDetailViewModel";
import { fetchItemById } from "@/features/items/details/queries/fetchItemById";
import type { ItemDetailViewModel } from "@/features/items/details/models/itemDetailViewModel";
import { useAuth } from "@/core/authentication/components/AuthenticationProvider";
import { isValidUuid } from "@/shared/validation/validateUuid";

interface ItemDetailsScreenProps {
  itemId: string;
}

function UnavailableItem({ message = "This item may have been removed or the link may be invalid." }: { message?: string }) {
  return (
    <main className="page-layout">
      <section className="form-panel item-details-panel">
        <ErrorState title="Item unavailable" message={message} />
      </section>
    </main>
  );
}

export default function ItemDetailsScreen({ itemId }: ItemDetailsScreenProps) {
  const { session } = useAuth();
  const [item, setItem] = useState<ItemDetailViewModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadItem = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      if (!isValidUuid(itemId)) {
        if (active) {
          setItem(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const record = await fetchItemById(itemId);

        if (!active) {
          return;
        }

        const mappedItem = record ? mapItemDetailViewModel(record) : null;
        setItem(mappedItem);
        setErrorMessage(null);
      } catch (error) {
        if (!active) {
          return;
        }

        const message = error instanceof Error ? error.message : "We could not load this item right now.";
        setItem(null);
        setErrorMessage(message === "Supabase is not configured." ? "Item details are currently unavailable." : message);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadItem();

    return () => {
      active = false;
    };
  }, [itemId, session]);

  if (isLoading) {
    return (
      <main className="page-layout">
        <section className="form-panel item-details-panel">
          <p className="site-note">Loading item details...</p>
        </section>
      </main>
    );
  }

  if (errorMessage || !item) {
    return <UnavailableItem message={errorMessage ?? undefined} />;
  }

  return (
    <main className="page-layout">
      <section className="form-panel item-details-panel">
        <div className="page-heading">
          <p className="eyebrow">Item details</p>
          <h1>{item.name}</h1>
          <span className="detail-badge">{item.type}</span>
          <p className="site-note">Review the full details for this lost or found report.</p>
        </div>

        <ItemDetailSummary item={item} />

        {item.type === "found" && (item.status === "submitted" || item.status === "active") ? (
          <div className="detail-card" style={{ marginTop: 16 }}>
            <div style={{ display: "grid", gap: 12 }}>
              <h2 style={{ margin: 0, fontSize: "1.25rem" }}>Think this is your item?</h2>
              <p style={{ margin: 0, color: "var(--text-secondary)" }}>
                If you believe this item belongs to you, you may submit a claim for review by the Lost & Found Office.
              </p>
              <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                <Link href={`/item/${item.id}/claim`} className="primary-button">
                  Claim this Item
                </Link>
                <Link href="/" className="secondary-link" aria-hidden>
                  Back to items
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="detail-action">
            <Link href="/" className="secondary-link">
              Back to items
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
