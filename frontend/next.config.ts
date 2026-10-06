import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // No custom headers – CORS is handled by the backend.

};
module.exports = {
  allowedDevOrigins: ['192.168.1.107', '10.61.184.44', 'localhost', '192.168.0.207'],
}

export default nextConfig;
