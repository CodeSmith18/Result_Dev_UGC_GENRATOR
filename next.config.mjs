/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: [
    "@remotion/bundler",
    "@remotion/renderer",
    "@remotion/media-utils",
    "remotion",
    "esbuild"
  ]
};

export default nextConfig;
