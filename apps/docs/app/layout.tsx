import type { ReactNode } from "react";
import "nextra-theme-docs/style.css";
import "./globals.css";

export const metadata = {
  title: "Region Dispatch Docs",
  description:
    "Documentation for the Region Dispatch system, including constitution, specs, and language guidance.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning dir="ltr">
      <body className="nextra-body">
        {children}
      </body>
    </html>
  );
}
