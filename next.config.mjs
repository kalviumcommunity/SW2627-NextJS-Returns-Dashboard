/** @type {import('next').NextConfig} */
const nextConfig = {
  // "standalone" output is only needed for the Docker/GCP Cloud Run
  // deployment path (see Dockerfile, which copies .next/standalone into the
  // runtime image). Vercel does its own build output tracing and does NOT
  // want this — combining the two can cause Prisma's native query engine
  // binary to be excluded from the deployed serverless function, which
  // crashes at runtime with a 500 even though everything works fine
  // locally under `next dev` (which ignores this setting entirely).
  // The Dockerfile sets DOCKER_BUILD=true before `npm run build` so only
  // that build path enables standalone mode; Vercel's build never sets
  // this variable, so it correctly gets Vercel's normal build output.
  ...(process.env.DOCKER_BUILD === "true" ? { output: "standalone" } : {}),
};

export default nextConfig;
