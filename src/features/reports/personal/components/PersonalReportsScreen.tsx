"use client";

import Link from "next/link";
import { useEffect } from "react";
import EmptyState from "@/components/EmptyState";
import PersonalReportCard from "@/features/reports/personal/components/PersonalReportCard";
import { useAuth } from "@/core/authentication/components/AuthenticationProvider";
import { usePersonalReports } from "@/features/reports/personal/hooks/usePersonalReports";
import { useRouter } from "next/navigation";

export default function PersonalReportsScreen() {
  const router = useRouter();
  const { session, isLoading: isAuthLoading } = useAuth();
  const { reports, isLoading, error, reload } = usePersonalReports(session?.user.id, isAuthLoading);

  useEffect(() => {
    if (!isAuthLoading && !session) {
      router.replace("/login?redirect=/my-reports");
    }
  }, [isAuthLoading, router, session]);

  if (isAuthLoading) {
    return (
      <main className="page-layout">
        <section className="form-panel">
          <p className="site-note">Checking your account...</p>
        </section>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="page-layout">
        <section className="form-panel">
          <p className="site-note">Redirecting to login...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="page-layout">
      <div className="report-panel">
        <section className="page-heading">
          <p className="eyebrow">Your activity</p>
          <h1>My Reports</h1>
          <p className="site-note">Track the lost and found reports you have submitted.</p>
        </section>

        <section className="form-panel" aria-live="polite">
          {isLoading ? (
            <p className="site-note">Loading your reports...</p>
          ) : error ? (
            <EmptyState
              title="Unable to load your reports"
              message="We could not load your submitted reports. Please try again."
              actionText="Try again"
              actionCallback={reload}
            />
          ) : reports.length === 0 ? (
            <section className="empty-state-card">
              <div className="empty-state-content">
                <p className="empty-state-eyebrow">No reports yet</p>
                <h2 className="empty-state-title">You haven&apos;t submitted any reports yet.</h2>
                <p className="empty-state-message">Report a lost or found item to start tracking it here.</p>
                <div className="detail-action">
                  <Link href="/report/lost" className="primary-button">Report Lost Item</Link>
                  <Link href="/report/found" className="secondary-link">Report Found Item</Link>
                </div>
              </div>
            </section>
          ) : (
            <div className="detail-list">
              {reports.map((report) => (
                <PersonalReportCard key={report.reportId} report={report} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
