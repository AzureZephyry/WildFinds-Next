import Link from "next/link";

export default function ClaimSuccessPage({ searchParams }: { searchParams: { ref?: string; status?: string; date?: string } }) {
  const reference = searchParams.ref || "—";
  const status = searchParams.status || "submitted";
  const date = searchParams.date || "";

  const submittedAt = date ? new Date(date) : null;

  return (
    <main className="page-content" style={{ padding: "32px 24px" }}>
      <section className="detail-card" style={{ maxWidth: 760, margin: "0 auto", padding: 24 }}>
        <h1>Claim Submitted</h1>
        <p>Your claim has been submitted successfully for review by the Lost & Found Office.</p>

        <div className="detail-grid" style={{ marginTop: 18 }}>
          <div className="detail-row">
            <span className="detail-label">Claim Reference</span>
            <span className="detail-value">{reference}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Current Status</span>
            <span className="detail-value">{status}</span>
          </div>
          {submittedAt ? (
            <div className="detail-row">
              <span className="detail-label">Submitted</span>
              <span className="detail-value">{submittedAt.toLocaleString()}</span>
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          <Link href="/my-claims" className="primary-button">
            Go to My Claims
          </Link>
          <Link href="/" className="secondary-link">
            Return Home
          </Link>
        </div>
      </section>
    </main>
  );
}
