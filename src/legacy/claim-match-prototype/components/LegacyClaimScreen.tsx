import Link from "next/link";
import ErrorState from "@/components/ErrorState";
import LegacyItemSummary from "@/legacy/claim-match-prototype/components/LegacyItemSummary";
import LegacyClaimMatchForm from "@/legacy/claim-match-prototype/components/LegacyClaimMatchForm";
import { getLegacyMockItemById } from "@/legacy/claim-match-prototype/data/legacyMockItems";

interface LegacyClaimScreenProps {
  itemId: string;
}

export default function LegacyClaimScreen({ itemId }: LegacyClaimScreenProps) {
  const item = getLegacyMockItemById(itemId);

  if (!item) {
    return (
      <main className="page-layout">
        <section className="form-panel report-panel">
          <ErrorState
            title="Item unavailable"
            message="This claim page may be invalid because the item was removed or the link is incorrect."
          />
        </section>
      </main>
    );
  }

  if (item.type !== "found") {
    return (
      <main className="page-layout">
        <section className="form-panel report-panel">
          <div className="page-heading">
            <p className="eyebrow">Claim</p>
            <h1>Invalid item type</h1>
            <p className="site-note">Only found items may be claimed here.</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page-layout">
      <section className="form-panel report-panel">
        <div className="page-heading">
          <p className="eyebrow">Claim</p>
          <h1>Claim this item</h1>
          <p className="site-note">Provide your details to claim the found item.</p>
        </div>

        <LegacyItemSummary item={item} />

        <LegacyClaimMatchForm
          item={item}
          eyebrow="Claim"
          heading="Claim this item"
          description="Provide your details to claim the found item."
          nameLabel="Your name"
          contactLabel="Contact information"
          detailLabel="Proof / identifying details"
          detailId="proofDetails"
          detailPlaceholder="Share why you are the owner or how you can verify it"
          submitLabel="Submit claim"
          validationMessage="Please complete all fields before submitting your claim."
          successTitle="Claim request submitted successfully"
          successMessage="A staff member or item owner will follow up with you shortly."
        />

        <div className="detail-action" style={{ marginTop: 20 }}>
          <Link href={`/item/${item.id}`} className="secondary-link">
            Back to item details
          </Link>
        </div>
      </section>
    </main>
  );
}
