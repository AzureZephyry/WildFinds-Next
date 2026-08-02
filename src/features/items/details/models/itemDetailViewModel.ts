import type { ItemStatus } from "@/features/items/shared/models/itemStatus";
import type { ItemType } from "@/features/items/shared/models/itemType";

export interface ItemDetailViewModel {
  id: string;
  referenceNumber?: string;
  type: ItemType;
  name: string;
  category: string;
  description?: string;
  brand?: string;
  color?: string;
  building?: string;
  location: string;
  dateReported: string;
  timeReported?: string;
  imageUrl?: string;
  status: ItemStatus;
  createdAt?: string;
  resolvedAt?: string;
}
