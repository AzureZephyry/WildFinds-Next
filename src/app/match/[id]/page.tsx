import LegacyMatchScreen from "@/legacy/claim-match-prototype/components/LegacyMatchScreen";

interface ConfirmMatchPageProps {
  params: Promise<{ id: string }>;
}

export default async function ConfirmMatchPage({ params }: ConfirmMatchPageProps) {
  const { id } = await params;
  return <LegacyMatchScreen itemId={id} />;
}
