export default function ClaimItemLoading() {
  return (
    <main className="page-content" style={{ padding: "32px 24px" }}>
      <section className="detail-card" style={{ maxWidth: 760, margin: "0 auto", padding: 24 }}>
        <div style={{ marginBottom: 24 }}>
          <p className="text-muted">Claim this Item</p>
          <h1 style={{ margin: "12px 0", fontSize: "2rem" }}>Loading claim information...</h1>
          <p style={{ margin: 0, color: "var(--text-secondary)" }}>
            Please wait while we verify whether this item is eligible for claiming.
          </p>
        </div>

        <div style={{ display: "grid", gap: 24 }}>
          <div className="skeleton-card" style={{ minHeight: 220, borderRadius: 18 }} />

          <div className="detail-card" style={{ padding: 24 }}>
            <div style={{ display: "grid", gap: 16 }}>
              <div style={{ height: 20, background: "var(--surface-muted)", borderRadius: 10 }} />
              <div style={{ height: 20, width: "60%", background: "var(--surface-muted)", borderRadius: 10 }} />
              <div style={{ height: 20, width: "45%", background: "var(--surface-muted)", borderRadius: 10 }} />
              <div style={{ height: 20, width: "50%", background: "var(--surface-muted)", borderRadius: 10 }} />
              <div style={{ height: 20, width: "35%", background: "var(--surface-muted)", borderRadius: 10 }} />
            </div>
          </div>

          <div style={{ display: "grid", gap: 14 }}>
            <div className="primary-button" style={{ opacity: 0.6, cursor: "default" }}>
              Continue
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
