/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["is1-ssl.mzstatic.com", "is2-ssl.mzstatic.com", "is3-ssl.mzstatic.com", "is4-ssl.mzstatic.com", "is5-ssl.mzstatic.com"],
  },
  webpack: (config, { isServer }) => {
    // face-api.js (and its node-fetch dependency) reference Node-only modules
    // like 'fs' and 'encoding' even though we only ever use it in the browser.
    // Tell webpack to treat them as unavailable on the client bundle instead
    // of trying (and failing) to resolve them.
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        encoding: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
