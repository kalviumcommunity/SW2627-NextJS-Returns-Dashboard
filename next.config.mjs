/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required: the Dockerfile copies .next/standalone into the runtime image.
  output: "standalone",
};

export default nextConfig;
