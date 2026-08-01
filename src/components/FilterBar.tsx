import type { FilterValues } from "@/features/items/browsing/models/itemFilterModels";

interface FilterBarProps {
  filters: FilterValues;
  categories: string[];
  statuses: string[];
  buildings: string[];
  onFilterChange: (key: keyof FilterValues, value: string) => void;
  onClearFilters: () => void;
}

export default function FilterBar({
  filters,
  categories,
  statuses,
  buildings,
  onFilterChange,
  onClearFilters,
}: FilterBarProps) {
  return (
    <section className="filter-bar" aria-label="Item filters">
      <div className="filter-group">
        <label htmlFor="categoryFilter">Category</label>
        <select
          id="categoryFilter"
          value={filters.category}
          onChange={(event) => onFilterChange("category", event.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="statusFilter">Status</label>
        <select
          id="statusFilter"
          value={filters.status}
          onChange={(event) => onFilterChange("status", event.target.value)}
        >
          <option value="">All statuses</option>
          {statuses.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="buildingFilter">Building</label>
        <select
          id="buildingFilter"
          value={filters.building}
          onChange={(event) => onFilterChange("building", event.target.value)}
        >
          <option value="">All buildings</option>
          {buildings.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="dateFilter">Date</label>
        <input
          id="dateFilter"
          type="date"
          value={filters.date}
          onChange={(event) => onFilterChange("date", event.target.value)}
        />
      </div>

      <button type="button" className="secondary-link" onClick={onClearFilters}>
        Clear filters
      </button>
    </section>
  );
}
