import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['react-apexcharts', 'apexcharts'],

  /* config options here */
  images: {
    domains: ["images.unsplash.com","example.com","source.unsplash.com", "res.cloudinary.com", "images.pexels.com"]
  }
};

export default nextConfig;
