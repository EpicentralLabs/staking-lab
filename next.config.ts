import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint warnings.
    ignoreDuringBuilds: true, // Allow build to continue with warnings
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has TypeScript warnings.
    ignoreBuildErrors: false, // Keep this false for safety - only ignore warnings, not errors
  }
}

export default nextConfig
