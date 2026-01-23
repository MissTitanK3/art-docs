/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/ui"],
  // Enable subdomain support
  trailingSlash: false,

  // Allow all subdomains in headers and middleware
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Subdomain-Support',
            value: 'enabled',
          },
        ],
      },
    ];
  },

  // Support for subdomain-based routing
  rewrites: async () => {
    return {
      beforeFiles: [
        // Subdomain routing: map subdomain requests to internal paths
        // This allows /api/route to be accessed via api.domain.com/route
        {
          source: '/:path*',
          destination: '/:path*',
          has: [
            {
              type: 'host',
              value: '(?<subdomain>[a-z0-9-]*)\\.(?<domain>.*)',
            },
          ],
        },
      ],
    };
  },
};

export default nextConfig;
