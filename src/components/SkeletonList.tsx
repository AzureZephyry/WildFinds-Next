import SkeletonCard from "@/components/SkeletonCard";

interface SkeletonListProps {
  count?: number;
}

export default function SkeletonList({ count = 4 }: SkeletonListProps) {
  return (
    <div className="skeleton-list">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}
