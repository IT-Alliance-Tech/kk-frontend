/** @type {import('next').NextConfig} */

// Parse Supabase hostname from env for Next.js image remotePatterns
const { URL } = require('url');
const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
let supabaseHostname = '';
try {
  if (rawSupabaseUrl) supabaseHostname = new URL(rawSupabaseUrl).hostname;
} catch (err) {
  console.warn('Could not parse SUPABASE URL for next.config remotePatterns:', rawSupabaseUrl);
  supabaseHostname = '';
}

const nextConfig = {
  turbopack: {},

  experimental: {
    // safe placeholder for experimental flags if needed
  },

  images: {
    remotePatterns: [
      // Only add a concrete hostname if we successfully parsed it from env
      ...(supabaseHostname ? [{
        protocol: 'https',
        hostname: supabaseHostname,
        port: '',
        pathname: '/storage/v1/object/public/**'
      }] : []),
      // Allow placeholder images
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**'
      }
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; img-src * data: blob;"
  },

  webpack: (config) => {
    config.ignoreWarnings = config.ignoreWarnings || [];
    config.ignoreWarnings.push((warn) =>
      /Critical dependency: the request of a dependency is an expression/.test(
        warn.message || ""
      )
    );
    return config;
  },
};

module.exports = nextConfig;
