"use client";

import { useEffect, useMemo, useState } from 'react';
import EmptyState from '@/components/EmptyState';
import HistoryCard from '@/components/HistoryCard';
import { getSupabaseClient } from '@/infrastructure/supabase/clients/browserSupabaseClient';
import { mapResolvedItemViewModel } from '@/features/items/history/mappers/mapResolvedItemViewModel';
import type { ResolvedItemViewModel } from '@/features/items/history/models/resolvedItemViewModel';
import type { ItemDatabaseRecord } from '@/features/items/shared/models/itemDatabaseRecord';

export default function HistoryPage() {
  const [items, setItems] = useState<ResolvedItemViewModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadHistory() {
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
          .select('id, reference_number, type, name, category, building, location, date_reported, image_url, status, resolved_at')
          .in('status', ['claimed', 'closed'])
          .order('resolved_at', { ascending: false, nullsFirst: false });

        if (queryError) {
          throw queryError;
        }

        if (!isMounted) {
          return;
        }

        const mappedItems = (data ?? []).map((item) => mapResolvedItemViewModel(item as ItemDatabaseRecord));

        setItems(mappedItems);
        setError(null);
      } catch (queryError) {
        if (isMounted) {
          const message = queryError instanceof Error ? queryError.message : 'Unable to load history from Supabase.';
          setError(message);
          setItems([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadHistory();

    return () => {
      isMounted = false;
    };
  }, []);

  const claimedItems = useMemo(() => items.filter((item) => item.status === 'claimed'), [items]);
  const closedItems = useMemo(() => items.filter((item) => item.status === 'closed'), [items]);

  return (
    <main className="page-layout">
      <div className="report-panel">
        <section className="page-heading">
          <p className="eyebrow">WildFinds History</p>
          <h1>Previously resolved lost and found reports</h1>
          <p className="site-note">
            Review previously claimed and closed cases from the WildFinds community.
          </p>
        </section>

        <section className="form-panel">
          {isLoading ? (
            <p className="site-note">Loading history…</p>
          ) : error ? (
            <EmptyState title="Unable to load history" message={error} />
          ) : items.length === 0 ? (
            <EmptyState title="No resolved reports yet" message="Resolved claims and closed cases will appear here once they are marked complete." />
          ) : (
            <>
              {claimedItems.length > 0 ? (
                <div style={{ marginBottom: 24 }}>
                  <h2 className="section-title">Claimed Items</h2>
                  <div className="detail-list">
                    {claimedItems.map((item) => (
                      <HistoryCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              ) : null}

              {closedItems.length > 0 ? (
                <div>
                  <h2 className="section-title">Closed Items</h2>
                  <div className="detail-list">
                    {closedItems.map((item) => (
                      <HistoryCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
