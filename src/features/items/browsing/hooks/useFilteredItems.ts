import { useMemo } from "react";
import { filterItemsByCriteria, filterItemsByTab } from "@/features/items/browsing/filtering/filterItemsByCriteria";
import { searchItemsByText } from "@/features/items/browsing/filtering/searchItemsByText";
import type { FilterValues } from "@/features/items/browsing/models/itemFilterModels";
import type { ItemCardViewModel } from "@/features/items/browsing/models/itemCardViewModel";

interface UseFilteredItemsArgs {
  activeTab: "lost" | "found";
  searchQuery: string;
  filters: FilterValues;
}

export function useFilteredItems(items: ItemCardViewModel[], { activeTab, searchQuery, filters }: UseFilteredItemsArgs) {
  return useMemo(() => {
    const tabFiltered = filterItemsByTab(items, activeTab);
    const searched = searchItemsByText(tabFiltered, searchQuery);
    return filterItemsByCriteria(searched, filters);
  }, [items, activeTab, searchQuery, filters]);
}
