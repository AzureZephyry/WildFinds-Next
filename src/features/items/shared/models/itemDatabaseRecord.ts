import type { ItemStatus } from "./itemStatus";
import type { ItemType } from "./itemType";

export interface ItemDatabaseRecord {
  id: string;
  reference_number: string | null;
  type: ItemType | null;
  name: string | null;
  category: string | null;
  description: string | null;
  brand: string | null;
  color: string | null;
  identifying_marks: string | null;
  building: string | null;
  location: string | null;
  date_reported: string | null;
  time_reported: string | null;
  image_url: string | null;
  status: ItemStatus | null;
  created_at: string | null;
  updated_at: string | null;
  resolved_at: string | null;
}
