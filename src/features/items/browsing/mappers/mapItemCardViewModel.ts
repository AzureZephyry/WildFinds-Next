import type { ItemCardViewModel } from "@/features/items/browsing/models/itemCardViewModel";
import type { ItemDatabaseRecord } from "@/features/items/shared/models/itemDatabaseRecord";

export function mapItemCardViewModel(record: ItemDatabaseRecord): ItemCardViewModel {
  return {
    id: record.id,
    name: record.name ?? "Untitled item",
    type: record.type ?? "lost",
    category: record.category ?? "Other",
    location: record.location ?? "Unknown location",
    dateReported: record.date_reported ?? "",
    status: record.status ?? "submitted",
    referenceNumber: record.reference_number ?? undefined,
    imageUrl: record.image_url ?? undefined,
    building: record.building ?? undefined,
    description: record.description ?? undefined,
    brand: record.brand ?? undefined,
    color: record.color ?? undefined,
  };
}
