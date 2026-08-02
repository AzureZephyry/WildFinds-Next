import { getSupabaseClient } from "@/infrastructure/supabase/clients/browserSupabaseClient";
import type { ItemDatabaseRecord } from "@/features/items/shared/models/itemDatabaseRecord";

export async function fetchItemById(itemId: string): Promise<ItemDatabaseRecord | null> {
  const client = getSupabaseClient();

  if (!client) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await client
    .from("items")
    .select("id, reference_number, type, name, category, description, brand, color, building, location, date_reported, time_reported, image_url, status, created_at, resolved_at")
    .eq("id", itemId)
    .maybeSingle<ItemDatabaseRecord>();

  if (error) {
    console.error("[WildFinds] Item detail query failed", {
      itemId,
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      fullError: error,
    });
    throw error;
  }

  return data ?? null;
}
