export type ItemStatus = "submitted" | "active" | "matched" | "claimed" | "closed";

export interface ItemDetail {
  id: string;
  referenceNumber?: string;
  type: "lost" | "found";
  name: string;
  category: string;
  description?: string;
  brand?: string;
  color?: string;
  identifyingMarks?: string;
  building?: string;
  location: string;
  dateReported: string;
  timeReported?: string;
  imageUrl?: string;
  status: ItemStatus;
  createdAt?: string;
  resolvedAt?: string;
}
