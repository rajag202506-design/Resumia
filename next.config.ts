import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    // Exclude microservices folders from build
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        '**/node_modules',
        '**/open-resume/**',
        '**/webcroller/**',
        '**/resume_score/**',
        '**/resume_ml_model/**',
      ],
    };
    return config;
  },
};

export default nextConfig;
