import { ChevronDown } from 'lucide-react';

// Respuestas basadas en lo que Quamtu ya ofrece; lo que depende de cada pedido se confirma por WhatsApp.
const PREGUNTAS = [
  { p: '¿Puedo elegir las piezas de mi PC?', r: 'Sí. En el armador eliges gabinete, procesador, placa madre, memoria, video, almacenamiento, refrigeración y fuente, y ves cómo queda en 3D. El sistema bloquea combinaciones incompatibles (por ejemplo, un procesador con una placa de otro socket) y avisa si la fuente no alcanza.' },
  { p: '¿Me arman el equipo o compro solo componentes?', r: 'Ambas opciones. Puedes pedir una PC armada por Quamtu, ensamblada bajo estándares rigurosos, o comprar solo los componentes que elegiste como repuestos.' },
  { p: '¿Los precios que veo son finales?', r: 'Son referenciales. Confirmamos precio final, stock y tiempo de entrega al cotizar, porque pueden variar según el equipo y el momento.' },
  { p: '¿Cómo hago la compra?', r: 'Por ahora la compra se coordina por WhatsApp con un especialista: le llega tu configuración completa y te guía en el pago y la entrega. El pago en línea estará disponible próximamente.' },
  { p: '¿Cotizan para empresas e instituciones?', r: 'Sí. Usa el cotizador: eliges equipos y componentes, indicas cantidades y tus datos (RUC o DNI, con factura si la necesitas) y un especialista te envía la cotización formal.' },
  { p: '¿Qué garantía y soporte tienen?', r: 'Nuestra relación no termina con la entrega: ofrecemos soporte post-venta con tiempos de respuesta optimizados y repuestos originales. Las condiciones exactas de garantía de cada equipo te las indicamos en la cotización.' },
  { p: '¿Qué significa 80 Plus en las fuentes?', r: 'Es una certificación de eficiencia energética. Una fuente 80 Plus aprovecha mejor la electricidad, genera menos calor y reduce el consumo eléctrico de tu infraestructura.' },
  { p: '¿Dónde están ubicados?', r: 'Nuestra ubicación central es Jr. Huaraz 1841, Breña, Lima. También puedes escribirnos por WhatsApp o visitar www.quamtu.com.' },
];

export default function Faq() {
  const json = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: PREGUNTAS.map((q) => ({ '@type': 'Question', name: q.p, acceptedAnswer: { '@type': 'Answer', text: q.r } })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />
      <div className="mx-auto mt-10 max-w-3xl divide-y divide-line rounded-2xl border border-line bg-panel/40">
        {PREGUNTAS.map((q) => (
          <details key={q.p} className="group px-5 py-1 sm:px-6">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-display text-base font-bold text-white [&::-webkit-details-marker]:hidden">
              {q.p}
              <ChevronDown size={18} className="shrink-0 text-claro transition group-open:rotate-180" />
            </summary>
            <p className="pb-5 text-slate-300">{q.r}</p>
          </details>
        ))}
      </div>
    </>
  );
}
