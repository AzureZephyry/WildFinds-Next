import { useMemo } from "react";
import { applyFilters, filterByTab } from "@/utils/filterItems";
import { searchItems } from "@/utils/searchItems";
import type { FilterValues, ItemCardItem } from "@/types/items";

interface UseSearchAndFilterArgs {
  activeTab: "lost" | "found";
  searchQuery: string;
  filters: FilterValues;
}

export function useSearchAndFilter(items: ItemCardItem[], { activeTab, searchQuery, filters }: UseSearchAndFilterArgs) {
  return useMemo(() => {
    const tabFiltered = filterByTab(items, activeTab);
    const searched = searchItems(tabFiltered, searchQuery);
    return applyFilters(searched, filters);
  }, [items, activeTab, searchQuery, filters]);
}
