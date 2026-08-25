import type { NextConfig } from "next";

// This site is mostly plain static HTML/CSS/JS (served from public/) with
// Next.js layered on top purely for the admin panel + its API routes.
// Next's public/ folder doesn't do directory-index resolution the way plain
// static hosting did, so the handful of clean URLs the static pages rely on
// (/, /about/, /gallery/) need explicit rewrites to their index.html files.
const nextConfig: NextConfig = {
  trailingSlash: true,
  async rewrites() {
    return [
      { source: "/", destination: "/index.html" },
      { source: "/about/", destination: "/about/index.html" },
      { source: "/gallery/", destination: "/gallery/index.html" },
    ];
  },
};

export default nextConfig;
