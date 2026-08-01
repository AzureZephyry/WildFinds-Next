"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ErrorState from "@/components/ErrorState";
import ItemSummary from "@/components/ItemSummary";
import { useAuth } from "@/core/authentication/components/AuthenticationProvider";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { ItemDetail, ItemStatus } from "@/types/itemDetail";

interface ItemDetailsPageProps {
  params: Promise<{ id: string }>;
}

interface SupabaseItemRecord {
  id: string;
  reference_number: string | null;
  type: string | null;
  name: string | null;
  category: string | null;
  description: string | null;
  brand: string | null;
  color: string | null;
  identifying_marks: string | null;
  building: string | null;
  location: string | null;
  date_reported: string | null;
  time_reported: string | null;
  image_url: string | null;
  status: string | null;
  created_at: string | null;
  resolved_at: string | null;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ITEM_STATUSES = new Set<ItemStatus>(["submitted", "active", "matched", "claimed", "closed"]);

function mapItem(record: SupabaseItemRecord): ItemDetail | null {
  if (record.type !== "lost" && record.type !== "found") {
    return null;
  }

  const status = record.status && ITEM_STATUSES.has(record.status as ItemStatus)
    ? record.status as ItemStatus
    : "submitted";

  return {
    id: record.id,
    referenceNumber: record.reference_number ?? undefined,
    type: record.type,
    name: record.name ?? "Untitled item",
    category: record.category ?? "Other",
    description: record.description ?? undefined,
    brand: record.brand ?? undefined,
    color: record.color ?? undefined,
    identifyingMarks: record.identifying_marks ?? undefined,
    building: record.building ?? undefined,
    location: record.location ?? "Unknown location",
    dateReported: record.date_reported ?? "",
    timeReported: record.time_reported ?? undefined,
    imageUrl: record.image_url ?? undefined,
    status,
    createdAt: record.created_at ?? undefined,
    resolvedAt: record.resolved_at ?? undefined,
  };
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

export default function ItemDetailsPage({ params }: ItemDetailsPageProps) {
  const { session } = useAuth();
  const [itemId, setItemId] = useState<string | null>(null);
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadParamsAndItem = async () => {
      const { id } = await params;

      if (!active) {
        return;
      }

      setItemId(id);

      if (!UUID_PATTERN.test(id)) {
        setIsLoading(false);
        return;
      }

      const client = getSupabaseClient();
      if (!client) {
        setErrorMessage("Item details are currently unavailable.");
        setIsLoading(false);
        return;
      }

      const { data, error } = await client
        .from("items")
        .select("id, reference_number, type, name, category, description, brand, color, identifying_marks, building, location, date_reported, time_reported, image_url, status, created_at, resolved_at")
        .eq("id", id)
        .maybeSingle<SupabaseItemRecord>();

      if (!active) {
        return;
      }

      if (error) {
        console.error("[WildFinds] Item detail query failed", {
          itemId: id,
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          fullError: error,
        });
        setErrorMessage("We could not load this item right now.");
        setIsLoading(false);
        return;
      }

      setItem(data ? mapItem(data) : null);
      setErrorMessage(null);
      setIsLoading(false);
    };

    void loadParamsAndItem();

    return () => {
      active = false;
    };
  }, [params, session]);

  if (isLoading) {
    return (
      <main className="page-layout">
        <section className="form-panel item-details-panel">
          <p className="site-note">Loading item details...</p>
        </section>
      </main>
    );
  }

  if (errorMessage || !item || !itemId) {
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

        <ItemSummary item={item} />

        <div className="detail-action">
          <Link href="/" className="secondary-link">
            Back to items
          </Link>
        </div>
      </section>
    </main>
  );
}
