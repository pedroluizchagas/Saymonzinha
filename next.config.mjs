/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      // Links antigos do protótipo levam à home nova em aprovação.
      { source: "/prototipo", destination: "/nova-home", permanent: false },
      { source: "/prototipo/:path*", destination: "/nova-home", permanent: false },
    ]
  },
}

export default nextConfig