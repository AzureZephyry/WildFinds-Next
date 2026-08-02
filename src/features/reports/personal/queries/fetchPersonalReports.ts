import { getCurrentProfileId } from "@/infrastructure/supabase/authentication/supabaseAuthentication";
import { getSupabaseClient } from "@/infrastructure/supabase/clients/browserSupabaseClient";
import type { ItemDatabaseRecord } from "@/features/items/shared/models/itemDatabaseRecord";

export interface PersonalReportDatabaseRecord {
  id: string;
  item_id: string;
  review_status: string | null;
  submitted_at: string | null;
}

type PersonalReportItemRecord = Pick<
  ItemDatabaseRecord,
  "id" | "reference_number" | "type" | "name" | "category" | "building" | "location" | "date_reported" | "image_url" | "status"
>;

export interface PersonalReportsQueryResult {
  reports: PersonalReportDatabaseRecord[];
  items: PersonalReportItemRecord[];
}

export async function fetchPersonalReports(sessionUserId: string): Promise<PersonalReportsQueryResult> {
  const client = getSupabaseClient();

  if (!client) {
    throw new Error("Supabase is not configured.");
  }

  const profileId = await getCurrentProfileId();

  if (!profileId) {
    throw new Error("Your account profile could not be found.");
  }

  console.log("[WildFinds] My Reports profile", {
    sessionUserId,
    profileId,
  });

  const { data: reportData, error: reportError } = await client
    .from("reports")
    .select("id, item_id, review_status, submitted_at")
    .eq("profile_id", profileId)
    .order("submitted_at", { ascending: false });

  console.log("[WildFinds] My Reports report query", {
    count: reportData?.length ?? 0,
    rows: reportData,
    error: reportError,
  });

  if (reportError) {
    throw reportError;
  }

  const reportRecords = (reportData ?? []) as PersonalReportDatabaseRecord[];
  const itemIds = reportRecords.map((report) => report.item_id);

  console.log("[WildFinds] My Reports item IDs", itemIds);

  if (itemIds.length === 0) {
    return { reports: reportRecords, items: [] };
  }

  const { data: itemData, error: itemError } = await client
    .from("items")
    .select("id, reference_number, type, name, category, building, location, date_reported, image_url, status")
    .in("id", itemIds);

  console.log("[WildFinds] My Reports item query", {
    count: itemData?.length ?? 0,
    rows: itemData,
    error: itemError,
  });

  if (itemError) {
    throw itemError;
  }

  return {
    reports: reportRecords,
    items: (itemData ?? []) as PersonalReportItemRecord[],
  };
}
