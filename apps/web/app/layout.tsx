import "./globals.css";
import type { Metadata } from "next";
import { runtimeConfig } from "@/config/runtime";
import { getCurrentSubdomain } from "@/lib/subdomain";
import { headers } from "next/headers";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const subdomain = getCurrentSubdomain(host);

  return {
    title: `ART App (${subdomain})`,
    description: `Current region: ${subdomain}`,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const subdomain = getCurrentSubdomain(host);

  return (
    <html lang="en">
      <body>
        <div data-host={host} data-env={runtimeConfig.appEnv} data-subdomain={subdomain}>
          {children}
        </div>
      </body>
    </html>
  );
}
