import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Financiamiento | LlévateloExpress',
  description: 'Conoce nuestras opciones de financiamiento para la adquisición de vehículos en Venezuela - Compra Programada y Adjudicación Inmediata.',
};

export default function FinanciamientoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-900 text-white pt-32 pb-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">
            Opciones de Financiamiento
          </h1>
          <p className="text-xl mb-8 text-center max-w-3xl mx-auto">
            Ofrecemos planes flexibles adaptados a tus necesidades para que puedas adquirir el vehículo que deseas.
          </p>
        </div>
      </div>

      {/* Comparison Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Compra Programada */}
            <div className="bg-white rounded-xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105">
              <div className="h-3 bg-primary-600"></div>
              <div className="p-8">
                <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Compra Programada con Adjudicación al 45%</h2>
                <div className="mb-6 text-sm font-semibold bg-green-50 text-green-700 py-2 px-4 rounded-md inline-block">
                  Ideal para planeación a mediano plazo
                </div>
                <p className="text-gray-600 mb-6">
                  Con esta modalidad, usted paga cuotas mensuales fijas y recibe su vehículo cuando haya completado el 45% del valor total. Este plan le permite adquirir su vehículo sin necesidad de un inicial significativo.
                </p>
                
                <h3 className="text-lg font-bold mb-3 text-gray-700">Características</h3>
                <ul className="mb-6 space-y-2">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span> 
                    Sin inicial requerida
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span> 
                    Cuotas mensuales fijas y accesibles
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span> 
                    Sistema de puntos por puntualidad
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span> 
                    Adjudicación al completar el 45% del valor
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span> 
                    Posibilidad de reducir tiempo de espera con pagos anticipados
                  </li>
                </ul>
                
                <h3 className="text-lg font-bold mb-3 text-gray-700">Requisitos</h3>
                <ul className="mb-6 space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-primary-500 mr-2">•</span> 
                    Documento de identidad
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-500 mr-2">•</span> 
                    Comprobante de ingresos
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-500 mr-2">•</span> 
                    Referencias personales
                  </li>
                </ul>
                
                <div className="mt-8">
                  <Link 
                    href="/calculadora" 
                    className="block w-full py-3 px-6 text-center bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-all duration-300"
                  >
                    Calcular Plan de Compra Programada
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Crédito de Adjudicación Inmediata */}
            <div className="bg-white rounded-xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105">
              <div className="h-3 bg-accent-500"></div>
              <div className="p-8">
                <div className="w-16 h-16 bg-accent-50 text-accent-600 rounded-full flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Crédito de Adjudicación Inmediata</h2>
                <div className="mb-6 text-sm font-semibold bg-blue-50 text-blue-700 py-2 px-4 rounded-md inline-block">
                  Entrega inmediata de su vehículo
                </div>
                <p className="text-gray-600 mb-6">
                  Con esta modalidad, usted recibe su vehículo inmediatamente después de aprobar su solicitud y pagar el inicial requerido. Ideal para quienes necesitan su vehículo con urgencia.
                </p>
                
                <h3 className="text-lg font-bold mb-3 text-gray-700">Características</h3>
                <ul className="mb-6 space-y-2">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span> 
                    Entrega inmediata del vehículo
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span> 
                    Plazos flexibles de pago (de 12 a 60 meses)
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span> 
                    Cuotas fijas mensuales
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span> 
                    Posibilidad de cancelación anticipada
                  </li>
                </ul>
                
                <h3 className="text-lg font-bold mb-3 text-gray-700">Requisitos</h3>
                <ul className="mb-6 space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-accent-500 mr-2">•</span> 
                    Documento de identidad
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent-500 mr-2">•</span> 
                    Comprobante de ingresos
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent-500 mr-2">•</span> 
                    Referencias bancarias
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent-500 mr-2">•</span> 
                    Inicial del 30% del valor del vehículo
                  </li>
                </ul>
                
                <div className="mt-8">
                  <Link 
                    href="/calculadora" 
                    className="block w-full py-3 px-6 text-center bg-accent-500 text-white font-semibold rounded-lg hover:bg-accent-600 transition-all duration-300"
                  >
                    Calcular Crédito Inmediato
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Proceso de Solicitud</h2>
          
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Line connector */}
              <div className="absolute left-16 top-0 bottom-0 w-1 bg-primary-200 hidden md:block"></div>
              
              {/* Steps */}
              <div className="space-y-12">
                {[
                  {
                    title: 'Elija su Vehículo',
                    description: 'Explore nuestro catálogo y seleccione el vehículo de su preferencia.',
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )
                  },
                  {
                    title: 'Use Nuestra Calculadora',
                    description: 'Compare opciones de financiamiento y elija la que mejor se adapte a sus necesidades.',
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    )
                  },
                  {
                    title: 'Envíe su Solicitud',
                    description: 'Complete el formulario de solicitud y suba los documentos requeridos.',
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )
                  },
                  {
                    title: 'Aprobación y Contrato',
                    description: 'Una vez aprobada su solicitud, firme el contrato y realice el pago inicial según la modalidad.',
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    )
                  },
                  {
                    title: 'Reciba su Vehículo',
                    description: 'Dependiendo del plan elegido, reciba su vehículo inmediatamente o al alcanzar el 45% del valor.',
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    )
                  }
                ].map((step, index) => (
                  <div key={index} className="flex items-start md:items-center">
                    <div className="flex-shrink-0 z-10">
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white border-4 border-primary-200 flex items-center justify-center text-primary-600">
                        {step.icon}
                      </div>
                    </div>
                    <div className="ml-6 bg-white rounded-lg shadow-md p-6 flex-grow transform transition-all duration-300 hover:shadow-lg">
                      <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Preguntas Frecuentes</h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                question: '¿Puedo cambiar de plan durante el proceso?',
                answer: 'Sí, es posible cambiar de un plan a otro, sujeto a ciertas condiciones y al estado de sus pagos. Consulte con nuestro equipo de atención al cliente para más detalles específicos sobre su caso.'
              },
              {
                question: '¿Qué sucede si no puedo realizar un pago a tiempo?',
                answer: 'Contamos con un período de gracia de 5 días. Después de este período, podría generarse un cargo por pago tardío. Recomendamos comunicarse inmediatamente con nuestro departamento de cobranzas si prevé alguna dificultad con sus pagos.'
              },
              {
                question: '¿Cómo funciona el sistema de puntos?',
                answer: 'Nuestro sistema de puntos recompensa la puntualidad en los pagos. Por cada pago realizado a tiempo, acumula puntos que pueden reducir sus días de espera para la adjudicación en el plan de Compra Programada.'
              },
              {
                question: '¿Puedo realizar pagos adicionales para adelantar la adjudicación?',
                answer: 'Sí, puede realizar pagos adicionales en cualquier momento para adelantar su adjudicación. Estos pagos reducirán proporcionalmente el tiempo de espera y el monto total financiado.'
              },
              {
                question: '¿Qué documentación necesito para solicitar el financiamiento?',
                answer: 'Los documentos básicos incluyen: documento de identidad, comprobante de ingresos, referencias personales o bancarias dependiendo del plan elegido. Para el Crédito de Adjudicación Inmediata, también se requiere comprobar la capacidad de pago del inicial.'
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 transform transition-all duration-300 hover:shadow-lg">
                <h3 className="text-xl font-bold mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Link 
              href="/calculadora" 
              className="inline-block py-3 px-8 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-all duration-300"
            >
              Calcular Mi Plan de Financiamiento
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
} 