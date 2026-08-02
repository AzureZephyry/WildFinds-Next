import type { ItemStatus } from "@/features/items/shared/models/itemStatus";
import type { ItemType } from "@/features/items/shared/models/itemType";

export interface ResolvedItemViewModel {
  id: string;
  name: string;
  type: ItemType;
  category: string;
  location: string;
  dateReported: string;
  referenceNumber?: string;
  imageUrl?: string;
  status: ItemStatus;
  resolvedAt?: string | null;
}
