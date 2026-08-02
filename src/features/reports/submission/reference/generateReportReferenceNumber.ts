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

export async function generateReportReferenceNumber(
  supabase: SupabaseClient,
  reportType: ItemType,
  reportDate: string,
): Promise<string> {
  const { data: generatedReference, error: referenceError } = await supabase.rpc("generate_reference_number", {
    report_type: reportType,
    report_date: reportDate,
  });

  if (referenceError) {
    const referenceMessage = getSupabaseErrorMessage(referenceError, "Unable to generate reference number.");
    throw new Error(`Unable to generate reference number: ${referenceMessage}`);
  }

  if (typeof generatedReference !== "string" || generatedReference.trim().length === 0) {
    throw new Error("Unable to generate reference number: the database returned an empty value.");
  }

  return generatedReference;
}
