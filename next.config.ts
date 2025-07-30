import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_INVITE_CODE: process.env.INVITE_CODE,
    NEXT_PUBLIC_INVITE_CODE_ACTIVE: process.env.INVITE_CODE_ACTIVE,
  }
};

export default nextConfig;
