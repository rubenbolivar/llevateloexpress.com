import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compra Programada | Financiamiento | LlévateloExpress',
  description: 'Información detallada sobre el plan de Compra Programada con Adjudicación al 45% - Financiamiento sin inicial para vehículos en Venezuela.',
};

export default function CompraProgramadaPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-900 text-white pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Compra Programada con Adjudicación al 45%
            </h1>
            <p className="text-xl mb-8">
              La manera más accesible de adquirir su vehículo sin necesidad de un inicial significativo.
            </p>
            <Link 
              href="/calculadora" 
              className="inline-block py-3 px-8 bg-white text-primary-700 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-lg"
            >
              Calcular Mi Plan
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-12">
            <div className="p-8">
              <h2 className="text-3xl font-bold mb-6 text-gray-800">¿Cómo Funciona?</h2>
              <p className="text-lg text-gray-600 mb-6">
                La Compra Programada es un sistema de adquisición donde usted realiza pagos mensuales fijos y recibe su vehículo cuando ha completado el 45% del valor total del mismo.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="bg-primary-50 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4 text-primary-700">Beneficios Principales</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2 text-xl">✓</span> 
                      <span>No requiere pago de inicial significativo</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2 text-xl">✓</span> 
                      <span>Cuotas mensuales más accesibles que un crédito tradicional</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2 text-xl">✓</span> 
                      <span>Sistema de puntos que recompensa la puntualidad</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2 text-xl">✓</span> 
                      <span>Posibilidad de reducir tiempo de espera con pagos adicionales</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4 text-blue-700">Condiciones del Plan</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span> 
                      <span>Plazo total: 60 meses (5 años)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span> 
                      <span>Adjudicación: Al completar el 45% del valor (aproximadamente en el mes 27)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span> 
                      <span>Cuota mensual: Fija durante todo el plan</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span> 
                      <span>Posibilidad de complementar con sistema de puntos para reducir tiempo de espera</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Sistema de Puntos por Puntualidad</h3>
                <p className="text-gray-600 mb-4">
                  Nuestro innovador sistema de puntos recompensa su puntualidad en los pagos, permitiéndole reducir el tiempo de espera para la adjudicación de su vehículo.
                </p>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 mt-4">
                    <thead>
                      <tr>
                        <th className="py-3 px-4 bg-gray-100 text-left">Acción</th>
                        <th className="py-3 px-4 bg-gray-100 text-center">Puntos</th>
                        <th className="py-3 px-4 bg-gray-100 text-left">Beneficio</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-200">
                        <td className="py-3 px-4">Pago a tiempo</td>
                        <td className="py-3 px-4 text-center">+5</td>
                        <td className="py-3 px-4">Acumulación normal de puntos</td>
                      </tr>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <td className="py-3 px-4">Pago anticipado</td>
                        <td className="py-3 px-4 text-center">+8</td>
                        <td className="py-3 px-4">Mayor acumulación por responsabilidad</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-3 px-4">Pago tardío (1-5 días)</td>
                        <td className="py-3 px-4 text-center">0</td>
                        <td className="py-3 px-4">Sin penalización pero sin acumulación</td>
                      </tr>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <td className="py-3 px-4">Pago muy tardío ({'>'}5 días)</td>
                        <td className="py-3 px-4 text-center">-10</td>
                        <td className="py-3 px-4">Penalización por pago fuera de tiempo</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">Pago doble</td>
                        <td className="py-3 px-4 text-center">+12</td>
                        <td className="py-3 px-4">Bonificación especial por compromiso</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-6 bg-yellow-50 p-4 rounded-lg">
                  <p className="text-yellow-800">
                    <strong>Nota:</strong> Los puntos acumulados pueden reducir hasta un 40% el tiempo de espera para la adjudicación, dependiendo de su nivel de puntuación.
                  </p>
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Documentación Requerida</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-primary-500 mr-2">•</span> 
                    <span>Documento de identidad vigente</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-500 mr-2">•</span> 
                    <span>Comprobante de ingresos (últimos 3 meses)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-500 mr-2">•</span> 
                    <span>Referencias personales (mínimo 2)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-500 mr-2">•</span> 
                    <span>RIF vigente</span>
                  </li>
                </ul>
              </div>
              
              <div className="flex justify-center mt-8">
                <Link 
                  href="/calculadora"
                  className="py-3 px-8 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-all duration-300 shadow-lg"
                >
                  Calcular Mi Plan de Compra Programada
                </Link>
              </div>
            </div>
          </div>
          
          {/* Testimonials */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-8 text-center">Experiencias de Nuestros Clientes</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  name: "Carlos Mendoza",
                  title: "Ingeniero Civil",
                  testimonial: "El sistema de puntos fue clave para mí. Logré reducir casi dos meses de espera gracias a mi disciplina con los pagos. Ahora disfruto de mi camioneta y sigo pagando cómodamente mis cuotas mensuales.",
                  vehicle: "Toyota Hilux 2023"
                },
                {
                  name: "María Fernández",
                  title: "Contadora",
                  testimonial: "La compra programada fue la única opción que se ajustaba a mi presupuesto. El proceso fue transparente y recibí mi auto incluso antes de lo esperado gracias a que pude hacer algunos pagos adicionales.",
                  vehicle: "Chevrolet Aveo 2024"
                }
              ].map((testimonial, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                  <p className="text-gray-600 italic mb-4">"{testimonial.testimonial}"</p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-xl">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <p className="font-bold">{testimonial.name}</p>
                      <p className="text-sm text-gray-500">{testimonial.title} - {testimonial.vehicle}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* FAQ Section */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-8 text-center">Preguntas Frecuentes</h2>
            <div className="space-y-4">
              {[
                {
                  question: "¿Qué sucede si necesito cambiar el modelo de vehículo durante el plan?",
                  answer: "Es posible cambiar el modelo antes de la adjudicación, ajustando las cuotas según la diferencia de precio. Después de la adjudicación, no es posible realizar este cambio."
                },
                {
                  question: "¿Puedo transferir mi plan a otra persona?",
                  answer: "Sí, el plan puede ser transferido a un tercero mediante un proceso de cesión de derechos, sujeto a aprobación por parte de nuestra administración."
                },
                {
                  question: "¿Qué garantías se requieren para este plan?",
                  answer: "En la Compra Programada, el mismo vehículo sirve como garantía principal. No se requieren garantías adicionales como hipotecas o avales."
                },
                {
                  question: "¿Qué ocurre si decido cancelar el plan antes de la adjudicación?",
                  answer: "En caso de cancelación antes de la adjudicación, se reembolsa el 85% del capital aportado, descontando gastos administrativos y penalidades según el contrato."
                }
              ].map((faq, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-bold mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* CTA Section */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-xl p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">¿Listo para comenzar?</h2>
            <p className="text-xl mb-6">Inicie su proceso de adquisición hoy mismo y comience a construir el camino hacia su nuevo vehículo.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href="/catalogo" 
                className="py-3 px-6 bg-white text-primary-700 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300"
              >
                Ver Catálogo
              </Link>
              <Link 
                href="/calculadora" 
                className="py-3 px-6 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-300"
              >
                Usar Calculadora
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 