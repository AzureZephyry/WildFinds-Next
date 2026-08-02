import { getSupabaseClient } from "@/infrastructure/supabase/clients/browserSupabaseClient";
import type {
  ClaimSubmissionContext,
  ClaimSubmissionContextResult,
} from "@/features/claims/submission/models/claimSubmissionContext";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isCanonicalUuid(value: string): boolean {
  return UUID_REGEX.test(value.trim());
}

type ClaimSubmissionContextRow = {
  item_id: string | null;
  source_report_id: string | null;
  reference_number: string | null;
  item_type: string | null;
  item_status: string | null;
  item_name: string | null;
  category: string | null;
  brand: string | null;
  color: string | null;
  building: string | null;
  location: string | null;
  date_reported: string | null;
  image_url: string | null;
  has_active_claim: boolean | null;
  is_eligible: boolean | null;
  unavailable_reason: string | null;
};

export async function fetchClaimSubmissionContext(itemId: string): Promise<ClaimSubmissionContextResult> {
  if (!isCanonicalUuid(itemId)) {
    return { status: "invalid_item_id" };
  }

  const client = getSupabaseClient();

  if (!client) {
    return { status: "error", message: "Supabase is not configured." };
  }

  const { data, error } = await client
    .rpc("get_claim_submission_context", { p_item_id: itemId })
    .returns<ClaimSubmissionContextRow[]>();

  if (error) {
    console.error("[WildFinds] Claim submission context query failed", {
      itemId,
      code: error.code,
      message: error.message,
    });
    return { status: "error", message: error.message ?? "Claim submission context query failed." };
  }

  if (!Array.isArray(data)) {
    return { status: "error", message: "Claim submission context query returned an unexpected payload." };
  }

  const row = data[0] ?? null;

  if (!row) {
    return { status: "error", message: "Claim submission context query returned no rows." };
  }

  return {
    status: "loaded",
    context: {
      itemId: row.item_id ?? itemId,
      sourceReportId: row.source_report_id,
      referenceNumber: row.reference_number,
      itemType: (row.item_type as ClaimSubmissionContext["itemType"]) ?? null,
      itemStatus: (row.item_status as ClaimSubmissionContext["itemStatus"]) ?? null,
      itemName: row.item_name,
      category: row.category,
      brand: row.brand,
      color: row.color,
      building: row.building,
      location: row.location,
      dateReported: row.date_reported,
      imageUrl: row.image_url,
      hasActiveClaim: row.has_active_claim ?? false,
      isEligible: row.is_eligible ?? false,
      unavailableReason: (row.unavailable_reason as ClaimSubmissionContext["unavailableReason"]) ?? null,
    },
  };
}
