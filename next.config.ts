import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // reactCompiler: true, // Disabled due to source map errors in dev

  // Enable standalone output for Docker
  output: 'standalone',

  // Disable image optimization for generated assets
  images: {
    unoptimized: true,
  },

  async headers() {
    const securityHeaders = [
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      // Report-Only first: monitors violations without blocking (safe with GTM-injected tags).
      // Promote to 'Content-Security-Policy' once the tag domains are confirmed.
      { key: 'Content-Security-Policy-Report-Only', value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://*.googletagmanager.com https://*.google-analytics.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https://*.google-analytics.com https://*.googletagmanager.com https://*.analytics.google.com; frame-src 'self' https://www.googletagmanager.com; frame-ancestors 'self'; base-uri 'self'; object-src 'none'; form-action 'self'" },
    ];
    return [
      { source: '/:path*', headers: securityHeaders },
      {
        // Cache /public static assets (logos, photos, og image, favicon).
        // Filenames aren't content-hashed, so use revalidation rather than 'immutable'.
        // The (?!_next/) guard avoids weakening Next's own immutable hashed assets.
        source: '/:asset((?!_next/).*\\.(?:png|jpe?g|webp|avif|svg|ico|gif))',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },
    ];
  },

  async redirects() {
    return [
      // The infra landing moved to its own repo/service (web-dev-studio/euhub-deploy,
      // Cloud Run euhub-infra-web). Its canonical host is deploy.euhub-ai.com.
      {
        source: '/infra',
        destination: 'https://deploy.euhub-ai.com',
        permanent: true,
      },
      {
        source: '/infra/:path*',
        destination: 'https://deploy.euhub-ai.com/:path*',
        permanent: true,
      },
      {
        source: '/',
        destination: '/en',
        permanent: true,
      },
      // Redirect any path that doesn't start with a locale to /en/path.
      // Excludes api/_next/static files; `infra` is kept in the negative lookahead so the
      // explicit /infra redirects above win and a stray /infra never falls through to /en/infra.
      {
        source: '/:path((?!en|sk|de|api|_next|favicon.ico|robots.txt|infra|.*\\..*).*)',
        destination: '/en/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
