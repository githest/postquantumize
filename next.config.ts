import type { NextConfig } from "next";

const securityHeaders = [
  // Stop other sites from framing the scanner (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  // Stop browsers from guessing content types.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Do not leak full URLs to the news sites we link out to.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Force HTTPS for a year.
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // The site needs none of these browser features.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // Production browser source maps stay off (the default). Do not enable
  // them without uploading to an error tracker and deleting them after.
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
