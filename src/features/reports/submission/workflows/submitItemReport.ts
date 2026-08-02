import type { ItemType } from "@/features/items/shared/models/itemType";
import { createOwnedReport } from "@/features/reports/submission/commands/createOwnedReport";
import { createReportedItem } from "@/features/reports/submission/commands/createReportedItem";
import type { ReportFormValues } from "@/features/reports/submission/models/reportFormModels";
import type { ReportSubmissionPayload } from "@/features/reports/submission/models/reportSubmissionModels";
import { findCreatedReportedItem } from "@/features/reports/submission/queries/findCreatedReportedItem";
import { generateReportReferenceNumber } from "@/features/reports/submission/reference/generateReportReferenceNumber";
import { getCurrentProfileId } from "@/infrastructure/supabase/authentication/supabaseAuthentication";
import { getSupabaseClient } from "@/infrastructure/supabase/clients/browserSupabaseClient";
import { uploadReportImage } from "@/features/reports/submission/storage/uploadReportImage";

export interface SubmitItemReportInput {
  reportType: ItemType;
  values: ReportFormValues;
  selectedImage: File | null;
}

export async function submitItemReport(input: SubmitItemReportInput): Promise<ReportSubmissionPayload> {
  const { reportType, values, selectedImage } = input;

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
    throw new Error("Authentication is required to submit a report.");
  }

  const profileId = await getCurrentProfileId();

  if (!profileId) {
    throw new Error("Your account profile could not be found.");
  }

  let imageUrl: string | null = null;
  let referenceNumber: string | null = null;
  let itemId: string | null = null;

  if (selectedImage) {
    imageUrl = await uploadReportImage(client, selectedImage);
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    referenceNumber = await generateReportReferenceNumber(client, reportType, values.dateReported);
    try {
      await createReportedItem(client, {
        referenceNumber,
        reportType,
        itemName: values.itemName,
        category: values.category,
        description: values.description,
        brand: values.brand,
        color: values.color,
        identifyingMarks: values.identifyingMarks,
        building: values.building,
        location: values.location,
        dateReported: values.dateReported,
        timeReported: values.timeReported,
        imageUrl,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "RETRY_REFERENCE_NUMBER") {
        continue;
      }
      throw error;
    }

    const createdItem = await findCreatedReportedItem(client, { referenceNumber });
    itemId = createdItem.id;
    break;
  }

  if (!referenceNumber || !itemId) {
    throw new Error("Unable to create item record.");
  }

  console.log("[WildFinds] Report ownership insert", {
    itemId,
    profileId,
    sessionUserId: session.user.id,
  });

  await createOwnedReport(client, {
    itemId,
    profileId,
    reporterName: values.reporterName,
    email: values.email,
    contactNumber: values.contactNumber,
  });

  return {
    referenceNumber,
  };
}
