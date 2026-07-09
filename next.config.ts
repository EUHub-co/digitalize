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
      {
        source: '/',
        missing: [{ type: 'host', value: 'infra.euhub-ai.com' }],
        destination: '/en',
        permanent: true,
      },
      // Redirect any path that doesn't start with a locale to /en/path
      // Note: This is a basic catch-all. For more complex i18n, consider using a library or the built-in i18n config if not using App Router manual handling.
      // However, since we removed middleware, we rely on the user landing on /en or /sk.
      // If they visit /some-page, we want to redirect to /en/some-page.
      // But we must exclude /api, /_next, etc.
      // Regex lookaheads are not fully supported in simple string sources, but we can try:
      {
        source: '/:path((?!en|sk|de|api|_next|favicon.ico|robots.txt|infra|.*\\..*).*)',
        missing: [{ type: 'host', value: 'infra.euhub-ai.com' }],
        destination: '/en/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
