/**
 * File: next.config.mjs
 * Purpose: Next.js 15 (App Router) configuration for Project Zenith.
 *
 * Notes:
 *  - CESIUM_BASE_URL is defined so Cesium can locate its static Workers/Assets/
 *    Widgets that the postinstall script copies into /public/cesium.
 *  - We mark `cesium` as transpiled because it ships ESM that Next must process.
 */
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['cesium'],
  env: {
    // Served from /public/cesium — see scripts/copy-cesium-assets.mjs
    CESIUM_BASE_URL: '/cesium',
  },
  webpack: (config, { dev, isServer }) => {
    // Cesium expects this global to resolve its worker + asset URLs at runtime.
    config.plugins = config.plugins || [];

    if (!dev && !isServer) {
      // Cesium bundles an Emscripten-generated Draco/Basis decoder whose
      // C-string octal escapes get corrupted by Next's SWC minifier into invalid
      // octal-escape-in-template-literal output ("Octal escape sequences are not
      // allowed in template strings"). That decoder is lazy-loaded into its own
      // async chunk, so the chunk becomes unparseable, the dynamic import('cesium')
      // fails with a ChunkLoadError, and the globe never mounts.
      //
      // Next's SWC minimizer does not honor a per-chunk `exclude`, so the only
      // reliable fix is to turn JS minification off for the client production
      // build. Cesium dominates the payload regardless, its unminified build is
      // known-valid, and Vercel serves everything brotli/gzip-compressed, so the
      // real over-the-wire impact is small.
      config.optimization.minimize = false;
    }
    return config;
  },
};

export default nextConfig;
