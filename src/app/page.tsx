"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import EmptyState from "@/components/EmptyState";
import FilterBar from "@/components/FilterBar";
import ItemCard from "@/components/ItemCard";
import Pagination from "@/components/Pagination";
import SearchBar from "@/components/SearchBar";
import SkeletonList from "@/components/SkeletonList";
import Tabs from "@/components/Tabs";
import { mockItems, getMockFilterOptions } from "@/data/mockItems";
import { useSearchAndFilter } from "@/hooks/useSearchAndFilter";
import type { FilterValues } from "@/types/items";

const ITEMS_PER_PAGE = 10;

const initialFilters: FilterValues = {
  category: "",
  status: "",
  building: "",
  date: "",
};

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"lost" | "found">("lost");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterValues>(initialFilters);
  const [isLoading, setIsLoading] = useState(false);

  const { categories, statuses, buildings } = getMockFilterOptions(mockItems);
  const filteredItems = useSearchAndFilter(mockItems, {
    activeTab,
    searchQuery,
    filters,
  });

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  const currentPageItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    setIsLoading(true);
    const timer = window.setTimeout(() => setIsLoading(false), 220);

    return () => window.clearTimeout(timer);
  }, [activeTab, searchQuery, filters, currentPage]);

  const handleTabChange = (tab: "lost" | "found") => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (name: keyof FilterValues, value: string) => {
    setFilters((previousFilters) => ({
      ...previousFilters,
      [name]: value,
    }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters(initialFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, page));
  };

  return (
    <section>
      <section className="top-panel">
        <SearchBar value={searchQuery} onSearchChange={handleSearchChange} />
        <div className="report-section">
          <Link href="/report/lost" className="report-button">
            + Report Lost Item
          </Link>
        </div>
      </section>

      <FilterBar
        filters={filters}
        categories={categories}
        statuses={statuses}
        buildings={buildings}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      <section className="content-panel">
        <Tabs activeTab={activeTab} onTabChange={handleTabChange} />
        <div className="tab-content" aria-live="polite">
          {isLoading ? (
            <SkeletonList />
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
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      </section>
    </section>
  );
}
