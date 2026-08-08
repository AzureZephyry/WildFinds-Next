import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { fetchClaimSubmissionContext } from "@/features/claims/submission/queries/fetchClaimSubmissionContext";
import ClaimSubmissionForm from "./ClaimSubmissionForm";

export const metadata: Metadata = {
  title: "Claim this item | WildFinds",
};

function StatusMessage({ title, body }: { title: string; body: string }) {
  return (
    <section className="empty-state-card" style={{ maxWidth: 620, margin: "0 auto" }}>
      <h1 style={{ marginTop: 0, fontSize: "1.75rem" }}>{title}</h1>
      <p style={{ margin: "1rem 0 0", lineHeight: 1.7 }}>{body}</p>
    </section>
  );
}

export default async function ClaimItemPage({ params }: { params: { id: string } }) {
  const itemId = params.id;
  const result = await fetchClaimSubmissionContext(itemId);

  if (result.status === "invalid_item_id") {
    return (
      <main className="page-content" style={{ padding: "32px 24px" }}>
        <StatusMessage
          title="Invalid Item Link"
          body="The item link is invalid. Please return to the Lost & Found listings."
        />
        <div style={{ marginTop: 24, display: "flex", justifyContent: "center" }}>
          <Link href="/" className="primary-button">
            Return to Home
          </Link>
        </div>
      </main>
    );
  }

  if (result.status === "error") {
    return (
      <main className="page-content" style={{ padding: "32px 24px" }}>
        <StatusMessage
          title="Unable to load claim information."
          body="Please try again later."
        />
      </main>
    );
  }

  const context = result.context;

  if (context.unavailableReason === "item_not_found") {
    return (
      <main className="page-content" style={{ padding: "32px 24px" }}>
        <StatusMessage title="This item no longer exists." body="" />
      </main>
    );
  }

  if (context.unavailableReason === "lost_item") {
    return (
      <main className="page-content" style={{ padding: "32px 24px" }}>
        <StatusMessage title="Claims are only available for Found items." body="" />
      </main>
    );
  }

  if (context.unavailableReason === "terminal_status") {
    return (
      <main className="page-content" style={{ padding: "32px 24px" }}>
        <StatusMessage title="This item is no longer accepting claims." body="" />
      </main>
    );
  }

  if (context.unavailableReason === "own_report") {
    return (
      <main className="page-content" style={{ padding: "32px 24px" }}>
        <StatusMessage title="You cannot submit a claim for an item you reported." body="" />
      </main>
    );
  }

  if (context.unavailableReason === "duplicate_active_claim") {
    return (
      <main className="page-content" style={{ padding: "32px 24px" }}>
        <StatusMessage title="You already have a pending claim for this item." body="" />
      </main>
    );
  }

  if (context.unavailableReason === "missing_source_report") {
    return (
      <main className="page-content" style={{ padding: "32px 24px" }}>
        <StatusMessage
          title="This item cannot currently accept claims."
          body="Please contact the Lost & Found Office."
        />
      </main>
    );
  }

  if (context.unavailableReason === "ambiguous_source_report") {
    return (
      <main className="page-content" style={{ padding: "32px 24px" }}>
        <StatusMessage
          title="This item requires staff review before claims become available."
          body=""
        />
      </main>
    );
  }

  if (context.unavailableReason === "invalid_source_report") {
    return (
      <main className="page-content" style={{ padding: "32px 24px" }}>
        <StatusMessage
          title="This item cannot currently accept claims."
          body="Please contact the Lost & Found Office."
        />
      </main>
    );
  }

  if (!context.isEligible) {
    return (
      <main className="page-content" style={{ padding: "32px 24px" }}>
        <StatusMessage
          title="This item cannot currently accept claims."
          body="Please contact the Lost & Found Office."
        />
      </main>
    );
  }

  return (
    <main className="page-content" style={{ padding: "32px 24px" }}>
      <section className="detail-card" style={{ maxWidth: 760, margin: "0 auto", display: "grid", gap: 24 }}>
        <div style={{ display: "grid", gap: 10 }}>
          <p className="text-muted">Claim this Item</p>
          <h1 style={{ margin: 0, fontSize: "2rem" }}>Claim this Item</h1>
          <p style={{ margin: 0, color: "var(--text-secondary)" }}>
            Provide information that will help the Lost & Found Office verify ownership.
          </p>
        </div>

        <div style={{ display: "grid", gap: 20 }}>
          <div>
            <p className="section-label" style={{ marginBottom: 10, fontWeight: 700 }}>Section A: Item Summary</p>
            <div className="detail-card" style={{ padding: 24 }}>
              <div style={{ display: "grid", gap: 20 }}>
                {context.imageUrl ? (
                  <div style={{ position: "relative", borderRadius: 18, overflow: "hidden", minHeight: 220, background: "var(--surface-muted)" }}>
                    <Image
                      src={context.imageUrl}
                      alt={context.itemName ?? "Claim item image"}
                      fill
                      sizes="(max-width: 768px) 100vw, 760px"
                      style={{ objectFit: "cover" }}
                      unoptimized
                    />
                  </div>
                ) : null}

                <div style={{ display: "grid", gap: 14 }}>
                  <div>
                    <p className="text-muted">Reference Number</p>
                    <p style={{ margin: 4, fontWeight: 700 }}>{context.referenceNumber ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted">Item Name</p>
                    <p style={{ margin: 4, fontWeight: 700 }}>{context.itemName ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted">Category</p>
                    <p style={{ margin: 4, fontWeight: 700 }}>{context.category ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted">Brand</p>
                    <p style={{ margin: 4, fontWeight: 700 }}>{context.brand ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted">Building</p>
                    <p style={{ margin: 4, fontWeight: 700 }}>{context.building ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted">Location Found</p>
                    <p style={{ margin: 4, fontWeight: 700 }}>{context.location ?? "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted">Date Reported</p>
                    <p style={{ margin: 4, fontWeight: 700 }}>{context.dateReported ?? "—"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="section-label" style={{ marginBottom: 10, fontWeight: 700 }}>Section B: Claim Form</p>
            <ClaimSubmissionForm />
          </div>
        </div>
      </section>
    </main>
  );
}
