import { getSupabaseClient } from "@/infrastructure/supabase/clients/browserSupabaseClient";
import type { ResolvedHistoryRecord } from "@/features/items/history/mappers/mapResolvedItemViewModel";

export async function fetchResolvedItems(): Promise<ResolvedHistoryRecord[]> {
  const client = getSupabaseClient();

  if (!client) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await client
    .from("items")
    .select("id, reference_number, type, name, category, building, location, date_reported, image_url, status, resolved_at")
    .in("status", ["claimed", "closed"])
    .order("resolved_at", { ascending: false, nullsFirst: false });

  if (error) {
    console.error("[WildFinds] Resolved history query failed", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      fullError: error,
    });
    throw error;
  }

  return (data ?? []) as ResolvedHistoryRecord[];
}
