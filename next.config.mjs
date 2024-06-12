/** @type {import('next').NextConfig} */

import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  disable: process.env.NODE_ENV === "development",
  dest: "public",
  cacheOnFrontendNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: false,
  fallbacks: {
    document: "/~offline"
  },
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig = {};


export default withPWA(nextConfig);