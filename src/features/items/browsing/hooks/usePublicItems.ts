import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/infrastructure/supabase/clients/browserSupabaseClient';
import type { ItemCardViewModel } from '@/features/items/browsing/models/itemCardViewModel';
import { mapItemCardViewModel } from '@/features/items/browsing/mappers/mapItemCardViewModel';
import type { ItemDatabaseRecord } from '@/features/items/shared/models/itemDatabaseRecord';

interface UsePublicItemsResult {
  items: ItemCardViewModel[];
  isLoading: boolean;
  error: string | null;
}

export function usePublicItems(): UsePublicItemsResult {
  const [items, setItems] = useState<ItemCardViewModel[]>([]);
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
          .select('id, reference_number, type, name, category, description, brand, color, building, location, date_reported, time_reported, image_url, status')
          .in('status', ['submitted', 'active', 'matched'])
          .order('created_at', { ascending: false });

        if (queryError) {
          console.error('[WildFinds] Supabase items query failed', {
            code: queryError.code,
            message: queryError.message,
            details: queryError.details,
            hint: queryError.hint,
            fullError: queryError,
          });
          throw queryError;
        }

        if (!isMounted) {
          return;
        }

        const mappedItems = (data ?? []).map((item) => mapItemCardViewModel(item as ItemDatabaseRecord));
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
