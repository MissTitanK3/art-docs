export type AppEnv = 'local' | 'staging' | 'production';

export type Subdomain = 'www' | 'api' | 'admin' | 'docs' | 'rt1' | 'rt2';

type RuntimeConfig = {
  appEnv: AppEnv;
  siteDomain: string;
  allowedSubdomains: Subdomain[];
  defaultSubdomain: Subdomain;
};

const DEFAULT_CONFIG: Record<AppEnv, Omit<RuntimeConfig, 'appEnv'>> = {
  local: {
    siteDomain: 'localhost:3000',
    allowedSubdomains: ['www', 'api', 'admin', 'docs', 'rt1', 'rt2'],
    defaultSubdomain: 'www',
  },
  staging: {
    siteDomain: 'staging.alwaysreadytools.org',
    allowedSubdomains: ['www', 'api', 'admin', 'docs', 'rt1', 'rt2'],
    defaultSubdomain: 'www',
  },
  production: {
    siteDomain: 'alwaysreadytools.org',
    allowedSubdomains: ['www', 'api', 'admin', 'docs', 'rt1', 'rt2'],
    defaultSubdomain: 'www',
  },
};

const envName = (process.env.NEXT_PUBLIC_APP_ENV as AppEnv | undefined) ?? 'local';

const defaults = DEFAULT_CONFIG[envName];

export const runtimeConfig: RuntimeConfig = {
  appEnv: envName,
  siteDomain: process.env.NEXT_PUBLIC_SITE_DOMAIN ?? defaults.siteDomain,
  allowedSubdomains: defaults.allowedSubdomains,
  defaultSubdomain: defaults.defaultSubdomain,
};
