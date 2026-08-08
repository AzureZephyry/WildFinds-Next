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

export interface CreateClaimInput {
  supabase: SupabaseClient;
  itemId: string;
  sourceReportId: string | null;
  claimantName: string;
  contactInfo: string;
  details: string;
}

export interface CreateClaimResult {
  id: string;
  referenceNumber: string;
  status: string;
  createdAt: string;
}

export async function createClaim(input: CreateClaimInput): Promise<CreateClaimResult> {
  const { supabase, itemId, sourceReportId, claimantName, contactInfo, details } = input;

  const { data: rpcResult, error: rpcError } = await supabase.rpc("create_claim", {
    p_item_id: itemId,
    p_source_report_id: sourceReportId,
    p_claimant_name: claimantName,
    p_contact_info: contactInfo,
    p_details: details,
  }) as { data: { id: string; reference_number: string; status: string; created_at: string } | null; error: unknown };

  if (rpcError) {
    const msg = getSupabaseErrorMessage(rpcError, "Unable to create claim.");
    throw new Error(msg);
  }

  if (!rpcResult) {
    throw new Error("Unable to create claim: database returned no record.");
  }

  return {
    id: rpcResult.id,
    referenceNumber: rpcResult.reference_number,
    status: rpcResult.status,
    createdAt: rpcResult.created_at,
  };
}
