import type { ItemStatus } from "@/features/items/shared/models/itemStatus";
import type { ItemType } from "@/features/items/shared/models/itemType";

export type ClaimSubmissionItemType = ItemType;
export type ClaimSubmissionItemStatus = ItemStatus;
export type ClaimSubmissionUnavailableReason =
  | "invalid_item_id"
  | "item_not_found"
  | "lost_item"
  | "terminal_status"
  | "missing_source_report"
  | "ambiguous_source_report"
  | "invalid_source_report"
  | "own_report"
  | "duplicate_active_claim";

export interface ClaimSubmissionContext {
  itemId: string;
  sourceReportId: string | null;
  referenceNumber: string | null;
  itemType: ClaimSubmissionItemType | null;
  itemStatus: ClaimSubmissionItemStatus | null;
  itemName: string | null;
  category: string | null;
  brand: string | null;
  color: string | null;
  building: string | null;
  location: string | null;
  dateReported: string | null;
  imageUrl: string | null;
  hasActiveClaim: boolean;
  isEligible: boolean;
  unavailableReason: ClaimSubmissionUnavailableReason | null;
}

export type ClaimSubmissionContextResult =
  | { status: "loaded"; context: ClaimSubmissionContext }
  | { status: "invalid_item_id" }
  | { status: "error"; message: string };
