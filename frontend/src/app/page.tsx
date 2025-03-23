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
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-primary-700 to-primary-900 text-white py-16">
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
                <Link href="/catalogo" className="btn btn-accent py-3 px-6 text-lg">
                  Ver Catálogo
                </Link>
                <Link href="/financiamiento" className="btn btn-outline bg-transparent border-white text-white hover:bg-white/10 py-3 px-6 text-lg">
                  Opciones de Financiamiento
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-full max-w-lg h-64 md:h-96">
                {/* Replace with actual image */}
                <div className="w-full h-full bg-primary-400 rounded-lg flex items-center justify-center text-white text-xl font-semibold">
                  Imagen de Vehículo
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Financing Options */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Opciones de Financiamiento
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="card p-8 border border-gray-200 hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-bold mb-4 text-primary-700">
                Compra Programada con Adjudicación al 45%
              </h3>
              <p className="mb-4">
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
            <div className="card p-8 border border-gray-200 hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-bold mb-4 text-primary-700">
                Crédito de Adjudicación Inmediata
              </h3>
              <p className="mb-4">
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
            {['Motocicletas', 'Automóviles', 'Camiones', 'Maquinaria Agrícola'].map((category, index) => (
              <div key={index} className="card overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-xl font-semibold text-gray-500">Imagen de {category}</span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{category}</h3>
                  <p className="text-gray-600 mb-4">
                    Explora nuestra selección de {category.toLowerCase()} con opciones de financiamiento flexibles.
                  </p>
                  <Link href={`/catalogo/${category.toLowerCase().replace(' ', '-')}`} className="text-primary-600 font-medium hover:text-primary-700">
                    Ver productos →
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
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {index + 1}
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
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
              <p className="mb-4">
                Plataforma líder de financiamiento de vehículos en Venezuela.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Enlaces Rápidos</h4>
              <ul className="space-y-2">
                <li><Link href="/catalogo" className="hover:text-accent-400">Catálogo</Link></li>
                <li><Link href="/financiamiento" className="hover:text-accent-400">Financiamiento</Link></li>
                <li><Link href="/calculadora" className="hover:text-accent-400">Calculadora</Link></li>
                <li><Link href="/nosotros" className="hover:text-accent-400">Sobre Nosotros</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Contacto</h4>
              <ul className="space-y-2">
                <li>Caracas, Venezuela</li>
                <li>info@llevateloexpress.com</li>
                <li>+58 412-123-4567</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">Síguenos</h4>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-accent-400">Facebook</a>
                <a href="#" className="hover:text-accent-400">Instagram</a>
                <a href="#" className="hover:text-accent-400">Twitter</a>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-secondary-700 text-center">
            <p>&copy; {new Date().getFullYear()} LlévateloExpress. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 