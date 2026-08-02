import type { ItemDatabaseRecord } from "@/features/items/shared/models/itemDatabaseRecord";
import type { ItemDetailViewModel } from "@/features/items/details/models/itemDetailViewModel";
import type { ItemStatus } from "@/features/items/shared/models/itemStatus";

const ITEM_STATUSES = new Set<ItemStatus>(["submitted", "active", "matched", "claimed", "closed"]);

export function mapItemDetailViewModel(record: ItemDatabaseRecord): ItemDetailViewModel | null {
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
