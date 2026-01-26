"use client";

import { useEffect, useState } from 'react';
import { listDispatches, type Dispatch } from '@/lib/api';
import {
  Input,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui';

export default function DispatchList() {
  const [items, setItems] = useState<Dispatch[]>([]);
  const [regionId, setRegionId] = useState('');
  const [status, setStatus] = useState<string>('');
  const [urgency, setUrgency] = useState<string>('');
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchList(reset = false) {
    setLoading(true);
    setError(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || undefined : undefined;
      const statusParam = (status || undefined) as
        | 'open'
        | 'acknowledged'
        | 'escalated'
        | 'closed'
        | undefined;
      const urgencyParam = (urgency || undefined) as 'low' | 'normal' | 'high' | undefined;
      const res = await listDispatches(
        {
          region_id: regionId || undefined,
          status: statusParam,
          urgency: urgencyParam,
          limit: 10,
          cursor: reset ? undefined : cursor || undefined,
        },
        token
      );
      setCursor(res.next_cursor ?? null);
      setItems((prev) => (reset ? res.data : [...prev, ...res.data]));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load dispatches';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchList(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Dispatches</h2>
      <div className="grid grid-cols-4 gap-4">
        <Input
          placeholder="Region (Zip)"
          value={regionId}
          onChange={(e) => setRegionId(e.target.value)}
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Status (any)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Any</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="acknowledged">Acknowledged</SelectItem>
            <SelectItem value="escalated">Escalated</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={urgency} onValueChange={setUrgency}>
          <SelectTrigger>
            <SelectValue placeholder="Urgency (any)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Any</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() => fetchList(true)}
          disabled={loading}
        >
          Apply Filters
        </Button>
      </div>
      {error && <div className="text-destructive text-sm">{error}</div>}
      <ul className="divide-y divide-border border border-border rounded bg-card text-card-foreground">
        {items.map((d) => (
          <li key={d.id} className="p-3">
            <div className="flex justify-between">
              <div>
                <div className="font-medium">{d.description}</div>
                <div className="text-xs text-muted-foreground">{d.region_id} • {d.status} • {d.urgency}</div>
              </div>
              <a href={`/dispatches/${d.id}`} className="text-primary text-sm hover:underline">View</a>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex justify-end">
        <Button
          onClick={() => fetchList(false)}
          disabled={!cursor || loading}
        >
          {loading ? 'Loading…' : cursor ? 'Load More' : 'No More'}
        </Button>
      </div>
    </section>
  );
}
