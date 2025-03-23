/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // !! WARN !!
    // Ignorar errores de tipo durante la compilación para producción
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  images: {
    domains: [
      'localhost',
      process.env.NEXT_PUBLIC_MEDIA_URL || 'media.llevateloexpress.com'
    ],
  },
  // Output standalone para simplificar el despliegue
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*', // Proxy to Django backend
      },
    ]
  },
}

module.exports = nextConfig 