interface ItemReferenceBadgeProps {
  referenceNumber?: string;
}

export default function ItemReferenceBadge({ referenceNumber }: ItemReferenceBadgeProps) {
  return <span className="reference-badge">{referenceNumber ?? "N/A"}</span>;
}
