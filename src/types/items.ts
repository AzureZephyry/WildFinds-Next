export interface ItemCardItem {
  id: string;
  name: string;
  type: string;
  category: string;
  location: string;
  dateReported: string;
  status: string;
  referenceNumber?: string;
  imageUrl?: string;
  building?: string;
  description?: string;
  brand?: string;
  color?: string;
  identifyingMarks?: string;
}

export interface FilterValues {
  category: string;
  status: string;
  building: string;
  date: string;
}

export interface FilterBarProps {
  filters: FilterValues;
  categories: string[];
  statuses: string[];
  buildings: string[];
  onFilterChange: (key: keyof FilterValues, value: string) => void;
  onClearFilters: () => void;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export interface SearchBarProps {
  value: string;
  onSearchChange: (value: string) => void;
}

export interface TabsProps {
  activeTab: "lost" | "found";
  onTabChange: (tab: "lost" | "found") => void;
}

export interface ItemCardProps {
  item: ItemCardItem;
}

export interface EmptyStateProps {
  title: string;
  message: string;
  actionText?: string;
  actionCallback?: () => void;
}

export interface SkeletonListProps {
  count?: number;
}
