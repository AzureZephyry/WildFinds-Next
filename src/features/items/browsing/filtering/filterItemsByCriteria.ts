import type { FilterValues } from "@/features/items/browsing/models/itemFilterModels";
import type { ItemCardViewModel } from "@/features/items/browsing/models/itemCardViewModel";

export function filterItemsByTab(items: ItemCardViewModel[], activeTab: string | undefined) {
  if (!activeTab) {
    return items;
  }

  return items.filter((item) => item.type.toLowerCase() === activeTab.toLowerCase());
}

export function filterItemsByCriteria(items: ItemCardViewModel[], filters: FilterValues) {
  if (!filters) {
    return items;
  }

  return items.filter((item) => {
    if (filters.category && item.category !== filters.category) {
      return false;
    }

    if (filters.status && item.status !== filters.status) {
      return false;
    }

    if (filters.building && item.building !== filters.building) {
      return false;
    }

    if (filters.date && item.dateReported !== filters.date) {
      return false;
    }

    return true;
  });
}

