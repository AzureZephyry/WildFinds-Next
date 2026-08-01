import type { ItemDatabaseRecord } from "@/features/items/shared/models/itemDatabaseRecord";
import type { ItemStatus } from "@/features/items/shared/models/itemStatus";
import type { ResolvedItemViewModel } from "@/features/items/history/models/resolvedItemViewModel";

const ITEM_STATUSES = new Set<ItemStatus>(["submitted", "active", "matched", "claimed", "closed"]);

export type ResolvedHistoryRecord = Pick<ItemDatabaseRecord, "id" | "reference_number" | "type" | "name" | "category" | "building" | "location" | "date_reported" | "image_url" | "status" | "resolved_at">;

export function mapResolvedItemViewModel(record: ResolvedHistoryRecord): ResolvedItemViewModel {
  const status = record.status && ITEM_STATUSES.has(record.status as ItemStatus)
    ? record.status as ItemStatus
    : "claimed";

  return {
    id: record.id,
    name: record.name ?? "Untitled item",
    type: record.type ?? "lost",
    category: record.category ?? "Other",
    location: record.location ?? "Unknown location",
    dateReported: record.date_reported ?? "",
    referenceNumber: record.reference_number ?? undefined,
    imageUrl: record.image_url ?? undefined,
    status,
    resolvedAt: record.resolved_at ?? null,
  };
}
