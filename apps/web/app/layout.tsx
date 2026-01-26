import "./globals.css";
import type { Metadata } from "next";
import { getCurrentSubdomain } from "@/lib/subdomain";
import { headers } from "next/headers";
import { Toaster } from "@repo/ui";
import { Providers } from "@/components/Providers";

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
    <html lang="en" suppressHydrationWarning>
      <body className="">
        <Providers host={host} subdomain={subdomain}>
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
