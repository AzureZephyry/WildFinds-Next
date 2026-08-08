import { getSupabaseClient } from "@/infrastructure/supabase/clients/browserSupabaseClient";
import { getCurrentProfileId } from "@/infrastructure/supabase/authentication/supabaseAuthentication";
import { createClaim } from "@/features/claims/submission/commands/createClaim";

export interface SubmitClaimInput {
  itemId: string;
  sourceReportId: string | null;
  claimantName: string;
  contactInfo: string;
  ownershipExplanation: string;
  verificationDetails: string;
  approximateDateLost?: string | null;
  approximateLocationLost?: string | null;
  additionalNotes?: string | null;
}

export interface SubmitClaimResult {
  referenceNumber: string;
  status: string;
  createdAt: string;
}

export async function submitClaim(input: SubmitClaimInput): Promise<SubmitClaimResult> {
  const client = getSupabaseClient();

  if (!client) {
    throw new Error("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  const {
    data: { session },
    error: sessionError,
  } = await client.auth.getSession();

  if (sessionError) {
    throw sessionError;
  }

  if (!session) {
    throw new Error("Authentication is required to submit a claim.");
  }

  const profileId = await getCurrentProfileId();

  if (!profileId) {
    throw new Error("Your account profile could not be found.");
  }

  const {
    itemId,
    sourceReportId,
    claimantName,
    contactInfo,
    ownershipExplanation,
    verificationDetails,
    approximateDateLost,
    approximateLocationLost,
    additionalNotes,
  } = input;

  const detailsParts = [
    ownershipExplanation.trim(),
    verificationDetails.trim(),
    approximateDateLost?.trim(),
    approximateLocationLost?.trim(),
    additionalNotes?.trim(),
  ].filter(Boolean);
  const details = detailsParts.join("\n\n");

  const result = await createClaim({
    supabase: client,
    itemId,
    sourceReportId,
    claimantName,
    contactInfo,
    details,
  });

  return {
    referenceNumber: result.referenceNumber,
    status: result.status,
    createdAt: result.createdAt,
  };
}
