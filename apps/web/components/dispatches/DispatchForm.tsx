"use client";

import { useState } from 'react';
import { postDispatch } from '@/lib/api';
import { parseApiError, getErrorGuidance, getSuccessMessage } from '@/lib/error-handler';
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
  const [urgency, setUrgency] = useState<'low' | 'normal' | 'critical'>('normal');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [errorDetails, setErrorDetails] = useState<{
    code?: string;
    actionLabel?: string;
    recoveryActions?: string[];
  }>({});
  const [dispatchId, setDispatchId] = useState<string>('');

  function validate() {
    const newErrors: { [key: string]: string } = {};
    if (!regionId.match(/^\d{5}$/)) newErrors.regionId = 'Region ID must be a 5-digit zip code';
    const latNum = Number(lat);
    const lonNum = Number(lon);
    if (Number.isNaN(latNum) || Number.isNaN(lonNum)) newErrors.coords = 'Coordinates must be numbers';
    if (latNum < -90 || latNum > 90) newErrors.coords = 'Latitude must be between -90 and 90';
    if (lonNum < -180 || lonNum > 180) newErrors.coords = 'Longitude must be between -180 and 180';
    if (!description.trim()) newErrors.description = 'Add a few words so responders know what is happening';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) {
      setMessage('Please fix the errors below');
      setStatus('error');
      setErrorDetails({ actionLabel: 'Fix and retry', recoveryActions: ['retry'] });
      return;
    }
    setLoading(true);
    setStatus('loading');
    setMessage('Sending your report...');
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

      const successMsg = getSuccessMessage({
        dispatch_id: created.id,
        urgency,
      });
      setMessage(successMsg);
      setDispatchId(created.id);
      setStatus('success');
      setRegionId('');
      setLat('');
      setLon('');
      setDescription('');
      setUrgency('normal');
      setErrors({});
      setErrorDetails({});
    } catch (err: unknown) {
      const errorContext = parseApiError(err);
      const guidance = getErrorGuidance(errorContext);
      setErrorDetails({
        code: guidance.code,
        actionLabel: guidance.actionLabel,
        recoveryActions: guidance.recoveryActions,
      });
      setMessage(guidance.message);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  }

  const handleRetry = () => {
    setMessage('');
    setStatus('idle');
    setErrorDetails({});
    void handleSubmit({ preventDefault: () => { } } as React.FormEvent);
  };

  const handleReset = () => {
    setRegionId('');
    setLat('');
    setLon('');
    setDescription('');
    setUrgency('normal');
    setErrors({});
    setMessage('');
    setStatus('idle');
    setErrorDetails({});
    setDispatchId('');
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-4 space-y-4" noValidate>
      <h1 className="text-xl font-semibold">Report something</h1>

      {message && (
        <div className="space-y-2">
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className={`text-sm rounded-lg px-3 py-2 ${status === 'success'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200'
                : status === 'error'
                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200'
                  : 'bg-muted text-muted-foreground'
              }`}
          >
            {message}
          </div>

          {/* Error recovery actions */}
          {status === 'error' && errorDetails.recoveryActions && (
            <div className="flex flex-col gap-2">
              {errorDetails.recoveryActions.includes('retry') && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleRetry}
                  className="w-full"
                >
                  {errorDetails.actionLabel || 'Try again'}
                </Button>
              )}
              {errorDetails.recoveryActions.includes('contact-support') && (
                <p className="text-xs text-muted-foreground px-1">
                  If the issue persists, contact support.
                </p>
              )}
            </div>
          )}

          {/* Success next steps */}
          {status === 'success' && (
            <div className="text-xs text-muted-foreground space-y-1">
              <p>✓ Your report is now visible to responders and the public in your area.</p>
              <p>✓ You can send another report or go back.</p>
            </div>
          )}
        </div>
      )}

      {status !== 'success' && (
        <>
          <div>
            <label htmlFor="region-id-input" className="block text-sm font-semibold text-foreground">Region (Zip)</label>
            <Input
              id="region-id-input"
              aria-label="Region zip code"
              aria-describedby="region-error region-help"
              aria-invalid={!!errors.regionId}
              value={regionId}
              onChange={(e) => setRegionId(e.target.value)}
              placeholder="97201"
            />
            {errors.regionId && (
              <p id="region-error" className="text-xs text-destructive mt-1">{errors.regionId}</p>
            )}
            <p id="region-help" className="text-xs text-muted-foreground mt-1">5-digit ZIP code</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="latitude-input" className="block text-sm font-semibold text-foreground">Latitude</label>
              <Input
                id="latitude-input"
                aria-label="Latitude coordinate"
                aria-describedby="coords-error coords-help"
                aria-invalid={!!errors.coords}
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="45.523"
              />
              {errors.coords && <p id="coords-error" className="text-xs text-destructive mt-1">{errors.coords}</p>}
              <p id="coords-help" className="text-xs text-muted-foreground mt-1">-90 to 90</p>
            </div>
            <div>
              <label htmlFor="longitude-input" className="block text-sm font-semibold text-foreground">Longitude</label>
              <Input
                id="longitude-input"
                aria-label="Longitude coordinate"
                aria-describedby="coords-error coords-help-lon"
                aria-invalid={!!errors.coords}
                value={lon}
                onChange={(e) => setLon(e.target.value)}
                placeholder="-122.676"
              />
              <p id="coords-help-lon" className="text-xs text-muted-foreground mt-1">-180 to 180</p>
            </div>
          </div>
          <div>
            <label htmlFor="description-textarea" className="block text-sm font-semibold text-foreground">What is happening?</label>
            <textarea
              id="description-textarea"
              aria-label="Report description"
              aria-describedby="description-error description-help"
              aria-invalid={!!errors.description}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border border-border bg-background text-foreground rounded p-2 focus:border-primary focus:outline-none"
              placeholder="What is going on? A few words are enough."
            />
            {errors.description && (
              <p id="description-error" className="text-xs text-destructive mt-1">{errors.description}</p>
            )}
            <p id="description-help" className="text-xs text-muted-foreground mt-1">Optional: What changed, who is affected, any hazards</p>
          </div>
          <div>
            <label htmlFor="urgency-select" className="block text-sm font-semibold text-foreground">Urgency</label>
            <Select value={urgency} onValueChange={(value) => setUrgency(value as 'low' | 'normal' | 'critical')}>
              <SelectTrigger className="w-full" id="urgency-select" aria-label="Report urgency level" aria-describedby="urgency-help">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">They are okay for now (low urgency)</SelectItem>
                <SelectItem value="normal">Needs help soon (normal urgency)</SelectItem>
                <SelectItem value="critical">Someone is in danger right now (critical urgency)</SelectItem>
              </SelectContent>
            </Select>
            <p id="urgency-help" className="text-xs text-muted-foreground mt-1">Select the urgency level that best describes the situation</p>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
            aria-label={loading ? "Sending your report, please wait" : "Send report"}
          >
            {loading ? 'Sending your report...' : 'Send report'}
          </Button>
        </>
      )}

      {status === 'success' && (
        <Button
          type="button"
          className="w-full"
          onClick={handleReset}
          aria-label="Send another report"
        >
          Send another report
        </Button>
      )}
    </form>
  );
}
