import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',
  
  // Configure external packages for server-side usage
  serverExternalPackages: ['prisma', '@prisma/client'],
};

export default nextConfig;
