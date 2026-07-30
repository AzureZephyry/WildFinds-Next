import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import type { ItemCardItem } from '@/types/items';

interface SupabaseItemRecord {
  id: string;
  reference_number: string | null;
  type: string | null;
  name: string | null;
  category: string | null;
  description: string | null;
  brand: string | null;
  color: string | null;
  identifying_marks: string | null;
  building: string | null;
  location: string | null;
  date_reported: string | null;
  time_reported: string | null;
  image_url: string | null;
  status: string | null;
}

interface UseItemsResult {
  items: ItemCardItem[];
  isLoading: boolean;
  error: string | null;
}

function mapItemRecord(record: SupabaseItemRecord): ItemCardItem {
  return {
    id: record.id,
    name: record.name ?? 'Untitled item',
    type: record.type ?? 'lost',
    category: record.category ?? 'Other',
    location: record.location ?? 'Unknown location',
    dateReported: record.date_reported ?? '',
    status: record.status ?? 'submitted',
    referenceNumber: record.reference_number ?? undefined,
    imageUrl: record.image_url ?? undefined,
    building: record.building ?? undefined,
    description: record.description ?? undefined,
    brand: record.brand ?? undefined,
    color: record.color ?? undefined,
    identifyingMarks: record.identifying_marks ?? undefined,
  };
}

export function useItems(): UseItemsResult {
  const [items, setItems] = useState<ItemCardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadItems() {
      const client = getSupabaseClient();

      if (!client) {
        if (isMounted) {
          setError('Supabase is not configured.');
          setItems([]);
          setIsLoading(false);
        }
        return;
      }

      try {
        const { data, error: queryError } = await client
          .from('items')
          .select('id, reference_number, type, name, category, description, brand, color, identifying_marks, building, location, date_reported, time_reported, image_url, status')
          .in('status', ['submitted', 'active', 'matched'])
          .order('created_at', { ascending: false });

        if (queryError) {
          throw queryError;
        }

        if (!isMounted) {
          return;
        }

        const mappedItems = (data ?? []).map((item) => mapItemRecord(item as SupabaseItemRecord));
        setItems(mappedItems);
        setError(null);
      } catch (queryError) {
        if (isMounted) {
          const message = queryError instanceof Error ? queryError.message : 'Unable to load reports from Supabase.';
          setError(message);
          setItems([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadItems();

    return () => {
      isMounted = false;
    };
  }, []);

  return { items, isLoading, error };
}
