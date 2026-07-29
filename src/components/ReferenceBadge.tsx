interface ReferenceBadgeProps {
  referenceNumber?: string;
}

export default function ReferenceBadge({ referenceNumber }: ReferenceBadgeProps) {
  return <span className="reference-badge">{referenceNumber ?? "N/A"}</span>;
}
