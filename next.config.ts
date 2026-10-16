import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/south-sauce",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
