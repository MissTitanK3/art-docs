"use client";

import { useEffect, useState } from 'react';
import { listDispatches, type Dispatch } from '@/lib/api';
import { Button } from '@repo/ui';

export default function DispatchList() {
  const [items, setItems] = useState<Dispatch[]>([]);
  const [offset, setOffset] = useState(0);
  const [pagination, setPagination] = useState<{
    limit: number;
    offset: number;
    next_offset: number | null;
    prev_offset: number | null;
    has_more: boolean;
    total: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchList(nextOffset = 0) {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || undefined : undefined;
      const res = await listDispatches(
        {
          active: true,
          limit: 20,
          offset: nextOffset,
        },
        token
      );
      setItems(res.data);
      setPagination(res.pagination);
      setOffset(res.pagination.offset);
      if (typeof window !== 'undefined') {
        const saved = window.sessionStorage.getItem('dispatchListScroll');
        if (saved) {
          window.scrollTo(0, Number(saved));
          window.sessionStorage.removeItem('dispatchListScroll');
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load dispatches';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchList(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Active Dispatches</h2>

      {loading && <div className="text-sm text-muted-foreground">Loading dispatches…</div>}
      {error && <div className="text-destructive text-sm">{error}</div>}
      {!loading && items.length === 0 && (
        <div className="text-sm text-muted-foreground">No active dispatches.</div>
      )}

      <ul className="divide-y divide-border border border-border rounded bg-card text-card-foreground">
        {items.map((d) => {
          const updated = d.updated_at ?? d.created_at;
          const statusLabel = d.status_display || d.status;
          return (
            <li key={d.id} className="p-3">
              <div className="flex justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-medium text-sm">{d.description || 'No summary provided'}</div>
                  <div className="text-xs text-muted-foreground">
                    {d.region_id} • {statusLabel} • Updated {new Date(updated).toLocaleString()}
                  </div>
                </div>
                <a
                  href={`/dispatches/${d.id}`}
                  className="text-primary text-sm hover:underline whitespace-nowrap"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.sessionStorage.setItem('dispatchListScroll', String(window.scrollY));
                    }
                  }}
                >
                  View
                </a>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => fetchList(pagination?.prev_offset ?? 0)}
          disabled={loading || pagination?.prev_offset === null || pagination?.prev_offset === undefined}
        >
          Previous
        </Button>
        <Button
          onClick={() => fetchList(pagination?.next_offset ?? (offset + (pagination?.limit ?? 20)))}
          disabled={loading || pagination?.next_offset === null || pagination?.next_offset === undefined}
        >
          Next
        </Button>
      </div>
    </section>
  );
}
