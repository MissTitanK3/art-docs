"use client";

import { useState } from 'react';
import { toast } from 'sonner';
import { postDispatch } from '@/lib/api';
import {
  Input,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui';

export default function DispatchForm() {
  const [regionId, setRegionId] = useState('');
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<'low' | 'normal' | 'high'>('normal');
  const [loading, setLoading] = useState(false);

  function validate() {
    if (!regionId.match(/^\d{5}$/)) return 'Region ID must be a 5-digit zip code';
    const latNum = Number(lat);
    const lonNum = Number(lon);
    if (Number.isNaN(latNum) || Number.isNaN(lonNum)) return 'Coordinates must be numbers';
    if (latNum < -90 || latNum > 90) return 'Latitude must be between -90 and 90';
    if (lonNum < -180 || lonNum > 180) return 'Longitude must be between -180 and 180';
    if (!description.trim()) return 'Description is required';
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      toast.error(validationError);
      return;
    }
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || undefined : undefined;
      const created = await postDispatch(
        {
          region_id: regionId,
          location: { lat: Number(lat), lon: Number(lon) },
          description,
          urgency,
        },
        token
      );
      toast.success(`Dispatch created with ID ${created.id}`);
      setRegionId('');
      setLat('');
      setLon('');
      setDescription('');
      setUrgency('normal');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create dispatch';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-4 space-y-4">
      <h1 className="text-xl font-semibold">Create Dispatch</h1>
      <div>
        <label className="block text-sm text-foreground">Region (Zip)</label>
        <Input
          value={regionId}
          onChange={(e) => setRegionId(e.target.value)}
          placeholder="97201"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-foreground">Latitude</label>
          <Input
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="45.523"
          />
        </div>
        <div>
          <label className="block text-sm text-foreground">Longitude</label>
          <Input
            value={lon}
            onChange={(e) => setLon(e.target.value)}
            placeholder="-122.676"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm text-foreground">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full border border-border bg-background text-foreground rounded p-2 focus:border-primary focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm text-foreground">Urgency</label>
        <Select value={urgency} onValueChange={(value) => setUrgency(value as 'low' | 'normal' | 'high')}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={loading}
      >
        {loading ? 'Submitting…' : 'Submit'}
      </Button>
    </form>
  );
}
