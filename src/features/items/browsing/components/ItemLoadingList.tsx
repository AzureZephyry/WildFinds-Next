import SkeletonCard from "@/components/SkeletonCard";

interface ItemLoadingListProps {
  count?: number;
}

export default function ItemLoadingList({ count = 4 }: ItemLoadingListProps) {
  return (
    <div className="skeleton-list">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}
