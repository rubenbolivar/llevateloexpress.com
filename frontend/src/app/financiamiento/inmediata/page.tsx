import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Crédito Inmediato | Financiamiento | LlévateloExpress',
  description: 'Información detallada sobre el Crédito de Adjudicación Inmediata - Llévate tu vehículo de inmediato financiado con nosotros.',
};

export default function AdjudicacionInmediataPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-accent-600 to-accent-800 text-white pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Crédito de Adjudicación Inmediata
            </h1>
            <p className="text-xl mb-8">
              Obtén tu vehículo hoy mismo y comienza a disfrutarlo mientras lo pagas.
            </p>
            <Link 
              href="/calculadora" 
              className="inline-block py-3 px-8 bg-white text-accent-700 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-lg"
            >
              Calcular Mi Crédito
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
                El Crédito de Adjudicación Inmediata es nuestra solución financiera que le permite recibir su vehículo inmediatamente después de la aprobación de su solicitud y el pago del inicial requerido.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="bg-accent-50 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4 text-accent-700">Beneficios Principales</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2 text-xl">✓</span> 
                      <span>Entrega inmediata del vehículo</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2 text-xl">✓</span> 
                      <span>Plazos flexibles de pago (12 a 60 meses)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2 text-xl">✓</span> 
                      <span>Cuotas fijas mensuales</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2 text-xl">✓</span> 
                      <span>Posibilidad de cancelación anticipada sin penalidades</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4 text-blue-700">Condiciones del Plan</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span> 
                      <span>Inicial: 30% del valor del vehículo</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span> 
                      <span>Plazos disponibles: 12, 24, 36, 48 o 60 meses</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span> 
                      <span>Tasa de interés: Competitiva y fija durante todo el plazo</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span> 
                      <span>El vehículo queda como garantía del crédito</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-4 text-gray-800">¿Por qué elegir el Crédito de Adjudicación Inmediata?</h3>
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <p className="text-gray-600 mb-6">
                    Esta modalidad está diseñada para quienes necesitan su vehículo con urgencia y tienen la capacidad de pagar un inicial. Es ideal para emprendedores, profesionales y personas que requieren movilidad inmediata para sus actividades diarias.
                  </p>
                  
                  <h4 className="text-xl font-bold mb-3 text-gray-700">Ventajas Diferenciadoras:</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-6 h-6 rounded-full bg-accent-100 flex items-center justify-center text-accent-700">
                          <span className="text-sm font-bold">1</span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-gray-700 font-semibold">Rapidez</p>
                        <p className="text-gray-600 text-sm">Aprobación en menos de 48 horas y entrega inmediata.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-6 h-6 rounded-full bg-accent-100 flex items-center justify-center text-accent-700">
                          <span className="text-sm font-bold">2</span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-gray-700 font-semibold">Flexibilidad</p>
                        <p className="text-gray-600 text-sm">Adapte el plan a su capacidad de pago eligiendo el plazo.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-6 h-6 rounded-full bg-accent-100 flex items-center justify-center text-accent-700">
                          <span className="text-sm font-bold">3</span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-gray-700 font-semibold">Seguridad</p>
                        <p className="text-gray-600 text-sm">Contrato transparente con cuotas fijas durante todo el plazo.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-6 h-6 rounded-full bg-accent-100 flex items-center justify-center text-accent-700">
                          <span className="text-sm font-bold">4</span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-gray-700 font-semibold">Conveniencia</p>
                        <p className="text-gray-600 text-sm">Múltiples canales para realizar sus pagos mensuales.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Comparativa de Plazos</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 mt-4">
                    <thead>
                      <tr>
                        <th className="py-3 px-4 bg-gray-100 text-left">Plazo</th>
                        <th className="py-3 px-4 bg-gray-100 text-center">Cuota Mensual*</th>
                        <th className="py-3 px-4 bg-gray-100 text-center">Inicial (30%)</th>
                        <th className="py-3 px-4 bg-gray-100 text-center">Costo Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-200">
                        <td className="py-3 px-4">12 meses</td>
                        <td className="py-3 px-4 text-center">Mayor cuota</td>
                        <td className="py-3 px-4 text-center">30%</td>
                        <td className="py-3 px-4 text-center">Menor costo total</td>
                      </tr>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <td className="py-3 px-4">24 meses</td>
                        <td className="py-3 px-4 text-center">Cuota intermedia</td>
                        <td className="py-3 px-4 text-center">30%</td>
                        <td className="py-3 px-4 text-center">Costo intermedio</td>
                      </tr>
                      <tr className="border-b border-gray-200">
                        <td className="py-3 px-4">36 meses</td>
                        <td className="py-3 px-4 text-center">Cuota reducida</td>
                        <td className="py-3 px-4 text-center">30%</td>
                        <td className="py-3 px-4 text-center">Costo intermedio-alto</td>
                      </tr>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <td className="py-3 px-4">48 meses</td>
                        <td className="py-3 px-4 text-center">Cuota muy accesible</td>
                        <td className="py-3 px-4 text-center">30%</td>
                        <td className="py-3 px-4 text-center">Costo alto</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">60 meses</td>
                        <td className="py-3 px-4 text-center">Cuota mínima</td>
                        <td className="py-3 px-4 text-center">30%</td>
                        <td className="py-3 px-4 text-center">Mayor costo total</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-gray-500 mt-2">*Las cuotas exactas dependen del valor del vehículo y la tasa aplicable. Use nuestra calculadora para obtener valores precisos.</p>
              </div>
              
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Documentación Requerida</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-accent-500 mr-2">•</span> 
                    <span>Documento de identidad vigente</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent-500 mr-2">•</span> 
                    <span>Comprobante de ingresos (últimos 3 meses)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent-500 mr-2">•</span> 
                    <span>Referencias bancarias (mínimo 2)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent-500 mr-2">•</span> 
                    <span>RIF vigente</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-accent-500 mr-2">•</span> 
                    <span>Comprobante de domicilio (recibo de servicios reciente)</span>
                  </li>
                </ul>
              </div>
              
              <div className="flex justify-center mt-8">
                <Link 
                  href="/calculadora"
                  className="py-3 px-8 bg-accent-600 text-white font-semibold rounded-lg hover:bg-accent-700 transition-all duration-300 shadow-lg"
                >
                  Calcular Mi Crédito Inmediato
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
                  name: "Roberto Gómez",
                  title: "Empresario",
                  testimonial: "Necesitaba un vehículo con urgencia para mi negocio. El crédito inmediato fue la solución perfecta, ya que me permitió tenerlo en solo 3 días después de aprobar mi solicitud.",
                  vehicle: "Ford Ranger 2024"
                },
                {
                  name: "Daniela Martínez",
                  title: "Médico",
                  testimonial: "El proceso fue ágil y sin burocracia. Presenté mis documentos el lunes y el jueves ya estaba recogiendo mi auto. Las cuotas son justas y el servicio excepcional.",
                  vehicle: "Honda CR-V 2023"
                }
              ].map((testimonial, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                  <p className="text-gray-600 italic mb-4">"{testimonial.testimonial}"</p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center text-accent-700 font-bold text-xl">
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
                  question: "¿Puedo pagar mi crédito antes del plazo establecido?",
                  answer: "Sí, puede realizar la cancelación anticipada del crédito en cualquier momento, sin penalidades. Se le descontarán los intereses no causados, resultando en un ahorro significativo."
                },
                {
                  question: "¿Qué sucede si me atraso en un pago?",
                  answer: "Contamos con un período de gracia de 5 días. Posteriormente, se aplicarán intereses de mora según lo establecido en el contrato. Recomendamos contactarnos inmediatamente si prevé alguna dificultad para cumplir con sus pagos."
                },
                {
                  question: "¿Puedo refinanciar mi crédito en caso de necesitarlo?",
                  answer: "Sí, ofrecemos opciones de refinanciamiento a partir del primer año del crédito, sujeto a evaluación de su historial de pagos y capacidad crediticia actual."
                },
                {
                  question: "¿El seguro del vehículo está incluido en el financiamiento?",
                  answer: "El seguro es obligatorio pero puede elegir incluirlo en el financiamiento o contratarlo por separado con nuestra aseguradora aliada o la de su preferencia, siempre que cumpla con los requisitos mínimos de cobertura."
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
          <div className="bg-gradient-to-r from-accent-600 to-accent-800 text-white rounded-xl p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">¿Listo para llevarte tu vehículo hoy mismo?</h2>
            <p className="text-xl mb-6">Inicie su proceso de aprobación rápida y disfrute de su nuevo vehículo en tiempo récord.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href="/catalogo" 
                className="py-3 px-6 bg-white text-accent-700 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300"
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