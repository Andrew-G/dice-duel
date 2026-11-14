import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.(mp3|wav|ogg)$/,
      type: "asset/resource",
      generator: {
        filename: "static/sfx/[name].[hash][ext]",
      },
    });

    return config;
  },
};

export default nextConfig;
