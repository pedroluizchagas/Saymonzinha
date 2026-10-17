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
      // Os endereços da aprovação e do protótipo levam à home.
      { source: "/nova-home", destination: "/", permanent: true },
      { source: "/prototipo", destination: "/", permanent: true },
      { source: "/prototipo/:path*", destination: "/", permanent: true },
    ]
  },
}

export default nextConfig