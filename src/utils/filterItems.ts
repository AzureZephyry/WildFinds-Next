import type { FilterValues, ItemCardItem } from "@/types/items";

export function filterByTab(items: ItemCardItem[], activeTab: string | undefined) {
  if (!activeTab) {
    return items;
  }

  return items.filter((item) => item.type.toLowerCase() === activeTab.toLowerCase());
}

export function applyFilters(items: ItemCardItem[], filters: FilterValues) {
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

export function getFilterOptions(items: ItemCardItem[]) {
  const categories = Array.from(new Set(items.map((item) => item.category).filter(Boolean))).sort();
  const statuses = Array.from(new Set(items.map((item) => item.status).filter(Boolean))).sort();
  const buildings = Array.from(new Set(items.map((item) => item.building).filter(Boolean))).sort();

  return { categories, statuses, buildings };
}
