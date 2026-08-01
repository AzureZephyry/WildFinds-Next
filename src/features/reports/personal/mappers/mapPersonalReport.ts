import type { PersonalReportViewModel } from "@/features/reports/personal/models/personalReportViewModel";
import type { PersonalReportDatabaseRecord, PersonalReportsQueryResult } from "@/features/reports/personal/queries/fetchPersonalReports";

export function mapPersonalReport(
  report: PersonalReportDatabaseRecord,
  item: PersonalReportsQueryResult["items"][number],
): PersonalReportViewModel {
  return {
    reportId: report.id,
    itemId: item.id,
    referenceNumber: item.reference_number ?? undefined,
    type: item.type === "found" ? "found" : "lost",
    name: item.name ?? "Untitled item",
    category: item.category ?? "Other",
    building: item.building ?? undefined,
    location: item.location ?? "Unknown location",
    dateReported: item.date_reported ?? "",
    imageUrl: item.image_url ?? undefined,
    itemStatus: item.status ?? "submitted",
    reviewStatus: report.review_status ?? "pending",
    submittedAt: report.submitted_at ?? "",
  };
}
