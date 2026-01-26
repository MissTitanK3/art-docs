"use client";

import { useEffect, useState } from 'react';
import { getDispatch, type Dispatch } from '@/lib/api';

export default function DispatchDetail({ id }: { id: string }) {
  const [data, setData] = useState<Dispatch | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function run() {
      setLoading(true);
      setError(null);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || undefined : undefined;
        const d = await getDispatch(id, token);
        setData(d);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load dispatch';
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    run();
  }, [id]);

  if (loading) return <div className="p-4 text-muted-foreground">Loading…</div>;
  if (error) return <div className="p-4 text-destructive">{error}</div>;
  if (!data) return null;

  return (
    <article className="max-w-3xl mx-auto p-4 space-y-2 bg-card text-card-foreground rounded">
      <h1 className="text-xl font-semibold">Dispatch #{data.id}</h1>
      <div className="text-sm text-muted-foreground">Region {data.region_id}</div>
      <div className="text-sm text-muted-foreground">Status {data.status} • Urgency {data.urgency}</div>
      <div className="text-sm text-muted-foreground">Location lat {data.location.lat} / lon {data.location.lon}</div>
      <p className="mt-2 text-foreground">{data.description}</p>
    </article>
  );
}
