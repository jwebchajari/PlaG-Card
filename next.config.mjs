import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development"
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Lets a production check build run next to `next dev` without sharing .next
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default withPWA(nextConfig);
