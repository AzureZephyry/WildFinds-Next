import { useEffect, useState } from "react";
import { getCurrentProfileId } from "@/lib/supabase/auth";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { MyReportItem } from "@/types/myReports";

interface ReportRecord {
  id: string;
  item_id: string;
  review_status: string | null;
  submitted_at: string | null;
}

interface ItemRecord {
  id: string;
  reference_number: string | null;
  type: string | null;
  name: string | null;
  category: string | null;
  building: string | null;
  location: string | null;
  date_reported: string | null;
  image_url: string | null;
  status: string | null;
}

interface UseMyReportsResult {
  reports: MyReportItem[];
  isLoading: boolean;
  error: string | null;
  reload: () => void;
}

function mapReport(report: ReportRecord, item: ItemRecord): MyReportItem {
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

export function useMyReports(sessionUserId: string | undefined, isAuthLoading: boolean): UseMyReportsResult {
  const [reports, setReports] = useState<MyReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadReports() {
      if (isAuthLoading) {
        return;
      }

      if (!sessionUserId) {
        setReports([]);
        setError(null);
        setIsLoading(false);
        return;
      }

      const client = getSupabaseClient();

      if (!client) {
        setReports([]);
        setError("Supabase is not configured.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const profileId = await getCurrentProfileId();

        if (!profileId) {
          throw new Error("Your account profile could not be found.");
        }

        const { data: reportData, error: reportError } = await client
          .from("reports")
          .select("id, item_id, review_status, submitted_at")
          .eq("profile_id", profileId)
          .order("submitted_at", { ascending: false });

        if (reportError) {
          throw reportError;
        }

        const reportRecords = (reportData ?? []) as ReportRecord[];
        const itemIds = reportRecords.map((report) => report.item_id);

        if (itemIds.length === 0) {
          if (isMounted) {
            setReports([]);
          }
          return;
        }

        const { data: itemData, error: itemError } = await client
          .from("items")
          .select("id, reference_number, type, name, category, building, location, date_reported, image_url, status")
          .in("id", itemIds);

        if (itemError) {
          throw itemError;
        }

        const itemRecords = (itemData ?? []) as ItemRecord[];
        const itemsById = new Map(itemRecords.map((item) => [item.id, item]));
        const mappedReports = reportRecords.flatMap((report) => {
          const item = itemsById.get(report.item_id);
          return item ? [mapReport(report, item)] : [];
        });

        if (isMounted) {
          setReports(mappedReports);
        }
      } catch (queryError) {
        if (!isMounted) {
          return;
        }

        const maybeError = typeof queryError === "object" && queryError !== null
          ? queryError as { code?: unknown; message?: unknown; details?: unknown; hint?: unknown }
          : {};

        console.error("[WildFinds] My Reports query failed", {
          code: maybeError.code,
          message: maybeError.message,
          details: maybeError.details,
          hint: maybeError.hint,
          fullError: queryError,
        });
        setReports([]);
        setError("Unable to load your reports.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadReports();

    return () => {
      isMounted = false;
    };
  }, [isAuthLoading, reloadToken, sessionUserId]);

  return {
    reports,
    isLoading,
    error,
    reload: () => setReloadToken((token) => token + 1),
  };
}
