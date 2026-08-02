"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import EmptyState from "@/components/EmptyState";
import ItemCard from "@/features/items/browsing/components/ItemCard";
import ItemFilterPanel from "@/features/items/browsing/components/ItemFilterPanel";
import ItemLoadingList from "@/features/items/browsing/components/ItemLoadingList";
import ItemPagination from "@/features/items/browsing/components/ItemPagination";
import ItemSearchInput from "@/features/items/browsing/components/ItemSearchInput";
import ItemTypeTabs from "@/features/items/browsing/components/ItemTypeTabs";
import { useFilteredItems } from "@/features/items/browsing/hooks/useFilteredItems";
import { usePublicItems } from "@/features/items/browsing/hooks/usePublicItems";
import type { FilterValues } from "@/features/items/browsing/models/itemFilterModels";

const ITEMS_PER_PAGE = 10;

const initialFilters: FilterValues = {
  category: "",
  status: "",
  building: "",
  date: "",
};

export default function ItemCatalog() {
  const [activeTab, setActiveTab] = useState<"lost" | "found">("lost");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterValues>(initialFilters);
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef<number | null>(null);
  const { items, isLoading: isItemsLoading, error } = usePublicItems();

  const categories = useMemo(
    () => Array.from(new Set(items.map((item) => item.category).filter((value): value is string => Boolean(value)))).sort(),
    [items],
  );
  const statuses = useMemo(
    () => Array.from(new Set(items.map((item) => item.status).filter((value): value is string => Boolean(value)))).sort(),
    [items],
  );
  const buildings = useMemo(
    () => Array.from(new Set(items.map((item) => item.building).filter((value): value is string => Boolean(value)))).sort(),
    [items],
  );
  const filteredItems = useFilteredItems(items, {
    activeTab,
    searchQuery,
    filters,
  });

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const currentPageItems = filteredItems.slice(
    (safeCurrentPage - 1) * ITEMS_PER_PAGE,
    safeCurrentPage * ITEMS_PER_PAGE,
  );
  const isFoundTab = activeTab === "found";
  const reportLabel = isFoundTab ? "Report Found Item" : "Report Lost Item";
  const reportHref = isFoundTab ? "/report/found" : "/report/lost";

  const startTransitionLoading = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }

    setIsLoading(true);
    timerRef.current = window.setTimeout(() => {
      setIsLoading(false);
      timerRef.current = null;
    }, 220);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleTabChange = (tab: "lost" | "found") => {
    setActiveTab(tab);
    setCurrentPage(1);
    startTransitionLoading();
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
    startTransitionLoading();
  };

  const handleFilterChange = (name: keyof FilterValues, value: string) => {
    setFilters((previousFilters) => ({
      ...previousFilters,
      [name]: value,
    }));
    setCurrentPage(1);
    startTransitionLoading();
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
    setCurrentPage(1);
    startTransitionLoading();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, page));
    startTransitionLoading();
  };

  return (
    <section>
      <section className="top-panel">
        <ItemSearchInput value={searchQuery} onSearchChange={handleSearchChange} />
        <div className="report-section">
          <Link href={reportHref} className="report-button">
            + {reportLabel}
          </Link>
        </div>
      </section>

      <ItemFilterPanel
        filters={filters}
        categories={categories}
        statuses={statuses}
        buildings={buildings}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      <section className="content-panel">
        <ItemTypeTabs activeTab={activeTab} onTabChange={handleTabChange} />
        <div className="tab-content" aria-live="polite">
          {isLoading || isItemsLoading ? (
            <ItemLoadingList />
          ) : error ? (
            <EmptyState
              title="Unable to load reports"
              message={error}
              actionText="Try again"
              actionCallback={() => window.location.reload()}
            />
          ) : currentPageItems.length === 0 ? (
            <EmptyState
              title={searchQuery ? "No items found" : activeTab === "lost" ? "No lost items reported yet" : "No found items available"}
              message={
                searchQuery
                  ? "We couldn't find any items matching your search. Try different keywords or adjust your filters."
                  : activeTab === "lost"
                    ? "There are currently no lost item reports available."
                    : "No found items have been submitted yet."
              }
              actionText="Clear filters"
              actionCallback={handleClearFilters}
            />
          ) : (
            currentPageItems.map((item) => <ItemCard key={item.id} item={item} />)
          )}
        </div>
        <ItemPagination currentPage={safeCurrentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      </section>
    </section>
  );
}
