export type AppEnv = "local" | "staging" | "production";

type RuntimeConfig = {
  appEnv: AppEnv;
  siteDomain: string;
  apiBaseUrl: string;
  /**
   * Server-only API base (e.g., internal network / DB proxy).
   * Do not expose secrets in NEXT_PUBLIC_* vars.
   */
  internalApiBaseUrl?: string;
};

const DEFAULT_CONFIG: Record<AppEnv, Omit<RuntimeConfig, "appEnv">> = {
  local: {
    siteDomain: "localhost:3000",
    apiBaseUrl: "http://localhost:4000",
    internalApiBaseUrl: "http://localhost:4000",
  },
  staging: {
    siteDomain: "staging.dispatch.example.com",
    apiBaseUrl: "https://staging-api.dispatch.example.com",
    internalApiBaseUrl: "https://staging-api.dispatch.example.com",
  },
  production: {
    siteDomain: "dispatch.example.com",
    apiBaseUrl: "https://api.dispatch.example.com",
    internalApiBaseUrl: "https://api.dispatch.example.com",
  },
};

const envName =
  (process.env.NEXT_PUBLIC_APP_ENV as AppEnv | undefined) ?? "local";

const defaults = DEFAULT_CONFIG[envName];

export const runtimeConfig: RuntimeConfig = {
  appEnv: envName,
  siteDomain: process.env.NEXT_PUBLIC_SITE_DOMAIN ?? defaults.siteDomain,
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? defaults.apiBaseUrl,
  internalApiBaseUrl:
    process.env.INTERNAL_API_BASE_URL ?? defaults.internalApiBaseUrl,
};

export function assertRuntimeConfig(): void {
  if (!runtimeConfig.apiBaseUrl) {
    throw new Error("Missing apiBaseUrl in runtime config.");
  }
}
