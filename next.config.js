/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features
  experimental: {
    serverActions: true, // Needed for "use server"
  },

  // Allow remote images from Supabase storage
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "prgkwuilcdaxujjflnbb.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    domains: ["via.placeholder.com", "placehold.co"],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; img-src * data: blob:;",
  },

  // Custom webpack configuration
  webpack: (config) => {
    // Ensure ignoreWarnings array exists
    config.ignoreWarnings = config.ignoreWarnings || [];

    // Add your specific warning ignore rule
    config.ignoreWarnings.push((warn) =>
      /Critical dependency: the request of a dependency is an expression/.test(
        warn.message || "",
      ),
    );

    return config;
  },
};

module.exports = nextConfig;
