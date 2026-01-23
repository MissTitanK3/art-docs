'use client';

import { useState } from 'react';
import { useSubdomain } from '@/lib/hooks/useSubdomain';
import { runtimeConfig } from '@/config/runtime';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui';

type HealthResponse = {
  status: string;
  timestamp: string;
  environment: {
    appEnv: string;
    siteDomain: string;
    subdomain: string;
  };
  region: {
    detected: string;
    fromHost: string;
    fromHeader: string | null;
  };
  supabase: {
    status: 'connected' | 'error';
    message: string;
  };
};

export default function Home() {
  const subdomain = useSubdomain();
  const [healthStatus, setHealthStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [healthMessage, setHealthMessage] = useState<string>('');
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);

  const checkApiHealth = async () => {
    setHealthStatus('loading');
    setHealthMessage('Checking API health endpoint...');

    try {
      const response = await fetch('/api/health');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: HealthResponse = await response.json();
      setHealthData(data);

      if (data.supabase.status === 'connected') {
        setHealthStatus('success');
        setHealthMessage(`✓ API Health: OK | Supabase: ${data.supabase.message} | Region: ${data.region.detected}`);
      } else {
        setHealthStatus('error');
        setHealthMessage(`✗ API Health: OK but Supabase error: ${data.supabase.message}`);
      }
    } catch (err) {
      setHealthStatus('error');
      setHealthMessage(`✗ API Health check failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setHealthData(null);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-8 p-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">Multi-Subdomain App</h1>
        <p className="text-muted-foreground">apps/web is configured for Sprint 0 multi-subdomain support.</p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Environment Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="font-semibold">Environment:</span>
            <span>{runtimeConfig.appEnv}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Site Domain:</span>
            <span className="text-sm">{runtimeConfig.siteDomain}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Current Subdomain:</span>
            <span className="font-mono text-blue-500">{subdomain}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Allowed Subdomains:</span>
            <span className="text-sm">{runtimeConfig.allowedSubdomains.join(', ')}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>API Health Check</CardTitle>
          <CardDescription>Test /api/health endpoint (Sprint 0)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={checkApiHealth}
            disabled={healthStatus === 'loading'}
            className="w-full"
          >
            {healthStatus === 'loading' ? 'Checking...' : 'Check API Health'}
          </Button>
          {healthStatus !== 'idle' && (
            <div className={`text-sm p-3 rounded ${healthStatus === 'success'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
              : healthStatus === 'error'
                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
              }`}>
              {healthMessage}
            </div>
          )}
          {healthData && healthStatus === 'success' && (
            <div className="text-xs space-y-1 p-2 bg-gray-100 dark:bg-gray-800 rounded">
              <div><strong>Region:</strong> {healthData.region.detected}</div>
              <div><strong>Environment:</strong> {healthData.environment.appEnv}</div>
              <div><strong>Timestamp:</strong> {new Date(healthData.timestamp).toLocaleString()}</div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
