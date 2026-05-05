/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Local Django
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/media/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/media/**",
      },

      // Docker (frontend container -> backend container)
      {
        protocol: "http",
        hostname: "backend",
        port: "8000",
        pathname: "/media/**",
      },
    ],
    // Allow all local public images
    unoptimized: process.env.NODE_ENV === "production",
  },
};

module.exports = nextConfig;