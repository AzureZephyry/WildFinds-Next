import type { ItemCardViewModel } from "@/features/items/browsing/models/itemCardViewModel";

export function searchItems(items: ItemCardViewModel[], query: string) {
  const normalizedQuery = String(query || "").trim().toLowerCase();

  if (!normalizedQuery) {
    return items;
  }

  return items.filter((item) => {
    const searchableValues = [
      item.referenceNumber,
      item.name,
      item.category,
      item.location,
      item.status,
      item.brand,
      item.color,
      item.description,
      item.building,
      item.identifyingMarks,
    ];

    return searchableValues.some((value) => String(value || "").toLowerCase().includes(normalizedQuery));
  });
}
