import type { SupabaseClient } from "@supabase/supabase-js";

function getSupabaseErrorMessage(error: unknown, fallback: string): string {
  if (typeof error !== "object" || error === null) {
    return fallback;
  }

  const maybeError = error as {
    message?: unknown;
    details?: unknown;
    hint?: unknown;
    code?: unknown;
  };

  const parts = [
    typeof maybeError.message === "string" ? maybeError.message : undefined,
    typeof maybeError.details === "string" ? maybeError.details : undefined,
    typeof maybeError.hint === "string" ? maybeError.hint : undefined,
    typeof maybeError.code === "string" ? `code: ${maybeError.code}` : undefined,
  ].filter((value): value is string => Boolean(value && value.trim().length > 0));

  return parts.length > 0 ? parts.join(" · ") : fallback;
}

export interface CreatedReportedItemRecord {
  id: string;
}

export interface FindCreatedReportedItemInput {
  referenceNumber: string;
}

export async function findCreatedReportedItem(
  supabase: SupabaseClient,
  input: FindCreatedReportedItemInput,
): Promise<CreatedReportedItemRecord> {
  const { data: insertedItem, error: itemFetchError } = await supabase
    .from("items")
    .select("id")
    .eq("reference_number", input.referenceNumber)
    .maybeSingle<{ id: string }>();

  if (itemFetchError) {
    throw new Error(`Unable to load the created item: ${getSupabaseErrorMessage(itemFetchError, "Unknown item fetch error.")}`);
  }

  if (!insertedItem?.id) {
    throw new Error(`Unable to load the created item for reference ${input.referenceNumber}.`);
  }

  return insertedItem;
}
