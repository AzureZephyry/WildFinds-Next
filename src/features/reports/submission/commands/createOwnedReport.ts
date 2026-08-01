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

export interface CreateOwnedReportInput {
  itemId: string;
  profileId: string;
  reporterName: string;
  email: string;
  contactNumber: string;
}

export async function createOwnedReport(
  supabase: SupabaseClient,
  input: CreateOwnedReportInput,
): Promise<void> {
  const { error: reportError } = await supabase.from("reports").insert({
    item_id: input.itemId,
    profile_id: input.profileId,
    reporter_name: input.reporterName,
    email: input.email,
    contact_number: input.contactNumber,
  });

  if (reportError) {
    const reportMessage = getSupabaseErrorMessage(reportError, "Unable to save report.");
    throw new Error(`Unable to save report: ${reportMessage}`);
  }
}
