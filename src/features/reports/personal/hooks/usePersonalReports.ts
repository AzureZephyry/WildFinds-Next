import { useEffect, useState } from "react";
import { mapPersonalReport } from "@/features/reports/personal/mappers/mapPersonalReport";
import { fetchPersonalReports } from "@/features/reports/personal/queries/fetchPersonalReports";
import type { PersonalReportViewModel } from "@/features/reports/personal/models/personalReportViewModel";

interface UsePersonalReportsResult {
  reports: PersonalReportViewModel[];
  isLoading: boolean;
  error: string | null;
  reload: () => void;
}

export function usePersonalReports(sessionUserId: string | undefined, isAuthLoading: boolean): UsePersonalReportsResult {
  const [reports, setReports] = useState<PersonalReportViewModel[]>([]);
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

      setIsLoading(true);
      setError(null);

      try {
        const { reports: reportRecords, items: itemRecords } = await fetchPersonalReports(sessionUserId);
        const itemsById = new Map(itemRecords.map((item) => [item.id, item]));
        const mappedReports = reportRecords.flatMap((report) => {
          const item = itemsById.get(report.item_id);
          return item ? [mapPersonalReport(report, item)] : [];
        });

        console.log("[WildFinds] My Reports mapped result", {
          count: mappedReports.length,
          rows: mappedReports,
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
