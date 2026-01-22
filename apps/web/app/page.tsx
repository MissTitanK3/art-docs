'use client';

import { useSubdomain } from '@/lib/hooks/useSubdomain';
import { runtimeConfig } from '@/config/runtime';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui';

export default function Home() {
  const subdomain = useSubdomain();

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
          <CardTitle>Subdomain Links</CardTitle>
          <CardDescription>Test subdomain routing (local)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {runtimeConfig.allowedSubdomains.map((sub) => (
              <Button
                key={sub}
                asChild
                className="w-full"
              >
                <a href={`/?subdomain=${sub}`}>{sub}</a>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
