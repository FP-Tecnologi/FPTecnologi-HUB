import { Plus } from 'lucide-react';

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
      <div className="mx-auto mt-10 grid max-w-3xl gap-3">
        {PREGUNTAS.map((q, n) => (
          <details key={q.p} className="faq group rounded-xl border border-line bg-panel/40 px-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-claro/70 hover:bg-cyan/5 hover:shadow-[0_8px_24px_rgba(35,141,193,.18)] open:border-claro open:bg-cyan/10 open:shadow-[0_8px_28px_rgba(35,141,193,.25)] sm:px-5">
            <summary className="flex cursor-pointer list-none items-center gap-4 py-4 font-display text-base font-bold text-white [&::-webkit-details-marker]:hidden">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-claro/40 text-xs text-claro transition-all duration-300 group-hover:scale-110 group-hover:bg-claro/15 group-open:bg-claro group-open:text-bg">{String(n + 1).padStart(2, '0')}</span>
              <span className="flex-1 transition-colors duration-300 group-hover:text-claro">{q.p}</span>
              <Plus size={20} className="shrink-0 text-claro transition-transform duration-300 group-hover:scale-125 group-open:rotate-45" />
            </summary>
            <p className="faq-resp pb-5 pl-12 pr-2 text-slate-300">{q.r}</p>
          </details>
        ))}
      </div>
    </>
  );
}
