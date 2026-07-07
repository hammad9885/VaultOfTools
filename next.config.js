/** @type {import("next").NextConfig} */
const nextConfig = {
  distDir: ".next-dev",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ph-files.imgix.net",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "cdn.simpleicons.org",
      },
    ],
  },
  serverExternalPackages: ["bcryptjs", "jsonwebtoken"],
};

module.exports = nextConfig;
