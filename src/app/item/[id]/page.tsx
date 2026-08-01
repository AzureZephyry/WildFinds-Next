import ItemDetailsScreen from "@/features/items/details/components/ItemDetailsScreen";

interface ItemDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ItemDetailsPage({ params }: ItemDetailsPageProps) {
  const { id } = await params;

  return <ItemDetailsScreen itemId={id} />;
}
