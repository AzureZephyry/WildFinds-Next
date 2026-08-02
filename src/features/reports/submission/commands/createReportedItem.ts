import type { SupabaseClient } from "@supabase/supabase-js";
import type { ItemType } from "@/features/items/shared/models/itemType";

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

export interface CreateReportedItemInput {
  referenceNumber: string;
  reportType: ItemType;
  itemName: string;
  category: string;
  description: string;
  brand: string;
  color: string;
  building: string;
  location: string;
  dateReported: string;
  timeReported: string;
  imageUrl: string | null;
}

export async function createReportedItem(
  supabase: SupabaseClient,
  input: CreateReportedItemInput,
): Promise<void> {
  const { error: itemInsertError } = await supabase.from("items").insert({
    reference_number: input.referenceNumber,
    type: input.reportType,
    name: input.itemName,
    category: input.category,
    description: input.description || null,
    brand: input.brand,
    color: input.color,
    building: input.building,
    location: input.location,
    date_reported: input.dateReported,
    time_reported: input.timeReported,
    image_url: input.imageUrl,
    status: "submitted",
  });

  if (itemInsertError) {
    const itemErrorMessage = getSupabaseErrorMessage(itemInsertError, "Unable to create item record.");
    if (itemInsertError.code === "23505" && itemInsertError.message.includes("reference_number")) {
      throw new Error("RETRY_REFERENCE_NUMBER");
    }

    throw new Error(`Unable to create item record: ${itemErrorMessage}`);
  }
}
