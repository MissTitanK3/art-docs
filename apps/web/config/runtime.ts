export type AppEnv = "local" | "staging" | "production";

export type Subdomain = "www" | "api" | "admin" | "docs" | "rt1" | "rt2";

type RuntimeConfig = {
  appEnv: AppEnv;
  siteDomain: string;
  allowedSubdomains: Subdomain[];
  defaultSubdomain: Subdomain;
  apiBaseUrl: string;
};

const DEFAULT_CONFIG: Record<AppEnv, Omit<RuntimeConfig, "appEnv">> = {
  local: {
    siteDomain: "localhost:3000",
    allowedSubdomains: ["www", "api", "admin", "docs", "rt1", "rt2"],
    defaultSubdomain: "www",
    apiBaseUrl: "", // Use same-origin /api (Next.js routes talk to Supabase)
  },
  staging: {
    siteDomain: "staging.alwaysreadytools.org",
    allowedSubdomains: ["www", "api", "admin", "docs", "rt1", "rt2"],
    defaultSubdomain: "www",
    apiBaseUrl: "https://staging-api.dispatch.example.com",
  },
  production: {
    siteDomain: "alwaysreadytools.org",
    allowedSubdomains: ["www", "api", "admin", "docs", "rt1", "rt2"],
    defaultSubdomain: "www",
    apiBaseUrl: "https://api.dispatch.example.com",
  },
};

const envName =
  (process.env.NEXT_PUBLIC_APP_ENV as AppEnv | undefined) ?? "local";

const defaults = DEFAULT_CONFIG[envName];

export const runtimeConfig: RuntimeConfig = {
  appEnv: envName,
  siteDomain: process.env.NEXT_PUBLIC_SITE_DOMAIN ?? defaults.siteDomain,
  allowedSubdomains: defaults.allowedSubdomains,
  defaultSubdomain: defaults.defaultSubdomain,
  // For local dev, always use same-origin /api (ignore NEXT_PUBLIC_API_BASE_URL env var)
  // For staging/production, use configured base or environment override
  apiBaseUrl:
    envName === "local"
      ? ""
      : (process.env.NEXT_PUBLIC_API_BASE_URL ?? defaults.apiBaseUrl),
};
