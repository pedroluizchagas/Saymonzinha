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
      // A loja virtual foi aprovada em /nova-loja; os links da aprovação levam à loja virtual.
      { source: "/nova-loja", destination: "/loja", permanent: true },
      { source: "/nova-loja/:path*", destination: "/loja/:path*", permanent: true },
    ]
  },
}

export default nextConfig