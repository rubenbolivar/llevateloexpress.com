import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LlévateloExpress - Financiamiento de Vehículos en Venezuela',
  description: 'Plataforma de financiamiento y adquisición de motocicletas, vehículos, camiones y maquinaria agrícola en Venezuela.',
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section - Adaptado para funcionar con Navbar transparente */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-900 text-white pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Tu camino hacia un nuevo vehículo comienza aquí
              </h1>
              <p className="text-xl mb-8">
                Financiamiento flexible y accesible para motocicletas, vehículos, camiones y maquinaria agrícola en Venezuela.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/catalogo" className="bg-accent-500 hover:bg-accent-600 text-white font-semibold py-3 px-6 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300">
                  Ver Catálogo
                </Link>
                <Link href="/calculadora" className="bg-transparent border-2 border-white text-white font-semibold hover:bg-white/10 py-3 px-6 text-lg rounded-lg transition-all duration-300">
                  Calculadora
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-full max-w-lg h-64 md:h-96">
                <div className="absolute -bottom-10 -right-10 w-full h-full bg-primary-400 rounded-tr-3xl rounded-bl-3xl shadow-xl"></div>
                <div className="absolute -top-10 -left-10 w-full h-full bg-accent-500/40 rounded-tl-3xl rounded-br-3xl backdrop-blur-sm shadow-xl"></div>
                <div className="relative w-full h-full bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center overflow-hidden border border-white/20 shadow-2xl">
                  <span className="text-white text-xl font-semibold">Imagen de Vehículo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financing Options */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Opciones de Financiamiento
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="card p-8 border border-gray-200 hover:shadow-lg transition-shadow rounded-lg hover:border-primary-300 group">
              <div className="bg-primary-50 p-3 w-16 h-16 rounded-full mb-4 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-primary-700">
                Compra Programada con Adjudicación al 45%
              </h3>
              <p className="mb-4 text-gray-600">
                Pague cuotas mensuales fijas y reciba su vehículo cuando haya completado el 45% del valor.
              </p>
              <ul className="mb-6 space-y-2">
                <li className="flex items-start">
                  <span className="text-accent-500 mr-2">✓</span> 
                  Sin inicial requerida
                </li>
                <li className="flex items-start">
                  <span className="text-accent-500 mr-2">✓</span> 
                  Cuotas mensuales accesibles
                </li>
                <li className="flex items-start">
                  <span className="text-accent-500 mr-2">✓</span> 
                  Sistema de puntos por puntualidad
                </li>
              </ul>
              <Link href="/financiamiento/programada" className="btn btn-primary w-full">
                Más Información
              </Link>
            </div>
            <div className="card p-8 border border-gray-200 hover:shadow-lg transition-shadow rounded-lg hover:border-primary-300 group">
              <div className="bg-primary-50 p-3 w-16 h-16 rounded-full mb-4 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-primary-700">
                Crédito de Adjudicación Inmediata
              </h3>
              <p className="mb-4 text-gray-600">
                Reciba su vehículo inmediatamente después de aprobar su solicitud y pagar el inicial.
              </p>
              <ul className="mb-6 space-y-2">
                <li className="flex items-start">
                  <span className="text-accent-500 mr-2">✓</span> 
                  Entrega inmediata
                </li>
                <li className="flex items-start">
                  <span className="text-accent-500 mr-2">✓</span> 
                  Plazos flexibles de pago
                </li>
                <li className="flex items-start">
                  <span className="text-accent-500 mr-2">✓</span> 
                  Cuotas fijas mensuales
                </li>
              </ul>
              <Link href="/financiamiento/inmediata" className="btn btn-primary w-full">
                Más Información
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Nuestro Catálogo
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: 'Motocicletas', icon: '🏍️' },
              { name: 'Automóviles', icon: '🚗' },
              { name: 'Camiones', icon: '🚚' },
              { name: 'Maquinaria Agrícola', icon: '🚜' }
            ].map((category, index) => (
              <div key={index} className="card overflow-hidden hover:shadow-lg transition-all duration-300 rounded-lg bg-white group">
                <div className="h-48 bg-gray-100 flex items-center justify-center group-hover:bg-primary-50 transition-colors">
                  <span className="text-5xl">{category.icon}</span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary-600 transition-colors">{category.name}</h3>
                  <p className="text-gray-600 mb-4">
                    Explora nuestra selección de {category.name.toLowerCase()} con opciones de financiamiento flexibles.
                  </p>
                  <Link href={`/catalogo/${category.name.toLowerCase().replace(' ', '-')}`} className="text-primary-600 font-medium hover:text-primary-700 flex items-center">
                    Ver productos 
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            ¿Cómo Funciona?
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                title: 'Elija su Vehículo',
                description: 'Explore nuestro catálogo y seleccione el vehículo de su preferencia.'
              },
              {
                title: 'Escoja su Plan',
                description: 'Seleccione entre nuestras opciones de financiamiento la que mejor se adapte a sus necesidades.'
              },
              {
                title: 'Solicite su Crédito',
                description: 'Complete el formulario de solicitud y envíe los documentos requeridos.'
              },
              {
                title: 'Reciba su Vehículo',
                description: 'Una vez aprobado, reciba su vehículo según el plan seleccionado y comience a pagar sus cuotas.'
              }
            ].map((step, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 group-hover:bg-primary-200 transition-colors">
                  {index + 1}
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary-600 transition-colors">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-xl font-bold mb-4">LlévateloExpress</h4>
              <p className="mb-4 text-gray-300">
                Plataforma líder de financiamiento de vehículos en Venezuela.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Enlaces Rápidos</h4>
              <ul className="space-y-2">
                <li><Link href="/catalogo" className="text-gray-300 hover:text-accent-400 transition-colors">Catálogo</Link></li>
                <li><Link href="/financiamiento" className="text-gray-300 hover:text-accent-400 transition-colors">Financiamiento</Link></li>
                <li><Link href="/calculadora" className="text-gray-300 hover:text-accent-400 transition-colors">Calculadora</Link></li>
                <li><Link href="/nosotros" className="text-gray-300 hover:text-accent-400 transition-colors">Sobre Nosotros</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Contacto</h4>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Caracas, Venezuela
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  info@llevateloexpress.com
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  +58 412-123-4567
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Síguenos</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-accent-400 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-300 hover:text-accent-400 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-300 hover:text-accent-400 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-secondary-700 text-center">
            <p className="text-gray-400">&copy; {new Date().getFullYear()} LlévateloExpress. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 