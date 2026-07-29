import SkeletonCard from "@/components/SkeletonCard";
import type { SkeletonListProps } from "@/types/items";

export default function SkeletonList({ count = 4 }: SkeletonListProps) {
  return (
    <div className="skeleton-list">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}
