import Link from "next/link";
import ErrorState from "@/components/ErrorState";
import ItemDetailSummary from "@/features/items/details/components/ItemDetailSummary";
import ClaimMatchForm from "@/components/ClaimMatchForm";
import { mockItems } from "@/data/mockItems";
import type { ItemCardViewModel } from "@/features/items/browsing/models/itemCardViewModel";

interface ConfirmMatchPageProps {
  params: Promise<{ id: string }>;
}

export default async function ConfirmMatchPage({ params }: ConfirmMatchPageProps) {
  const { id } = await params;
  const item = mockItems.find((entry) => entry.id === id) as ItemCardViewModel | undefined;

  if (!item) {
    return (
      <main className="page-layout">
        <section className="form-panel report-panel">
          <ErrorState
            title="Item unavailable"
            message="This match page may be invalid because the item was removed or the link is incorrect."
          />
        </section>
      </main>
    );
  }

  if (item.type !== "lost") {
    return (
      <main className="page-layout">
        <section className="form-panel report-panel">
          <div className="page-heading">
            <p className="eyebrow">Confirm</p>
            <h1>Invalid item type</h1>
            <p className="site-note">Only lost items may be confirmed here.</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page-layout">
      <section className="form-panel report-panel">
        <div className="page-heading">
          <p className="eyebrow">Confirm</p>
          <h1>Match this lost item</h1>
          <p className="site-note">Provide details to confirm this item is your lost property.</p>
        </div>

        <ItemDetailSummary item={item} />

        <ClaimMatchForm
          item={item}
          eyebrow="Confirm"
          heading="Match this lost item"
          description="Provide details to confirm this item is your lost property."
          nameLabel="Your name"
          contactLabel="Contact information"
          detailLabel="Explanation of why this matches"
          detailId="matchDetails"
          detailPlaceholder="Explain why this item matches your lost property"
          submitLabel="Submit match confirmation"
          validationMessage="Please complete all fields before submitting your match request."
          successTitle="Match request submitted successfully"
          successMessage="The report owner will review your confirmation request shortly."
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
