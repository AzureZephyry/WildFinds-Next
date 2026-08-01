import LegacyClaimScreen from "@/legacy/claim-match-prototype/components/LegacyClaimScreen";

interface ClaimItemPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClaimItemPage({ params }: ClaimItemPageProps) {
  const { id } = await params;
  return <LegacyClaimScreen itemId={id} />;
}
