import type { ItemStatus } from "@/features/items/shared/models/itemStatus";
import type { ItemType } from "@/features/items/shared/models/itemType";

export interface PersonalReportViewModel {
  reportId: string;
  itemId: string;
  referenceNumber?: string;
  type: ItemType;
  name: string;
  category: string;
  building?: string;
  location: string;
  dateReported: string;
  imageUrl?: string;
  itemStatus: ItemStatus;
  reviewStatus: string;
  submittedAt: string;
}
