import type { ItemType } from "@/features/items/shared/models/itemType";

export interface ItemCardViewModel {
  id: string;
  name: string;
  type: ItemType;
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
}
