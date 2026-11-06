import { BadgeCheck, CreditCard, IdCard, MousePointerClick } from 'lucide-react';
import BannerPagina from '@/components/BannerPagina';
import SeccionTitulo from '@/components/SeccionTitulo';
import Hexagono from '@/components/Hexagono';
import JsonLd from '@/components/JsonLd';
import Reveal from '@/components/motion/Reveal';
import { AbanicoBbva, LogoBbva } from '@/components/bbva/Tarjetas';
import FormBbva from '@/components/bbva/FormBbva';
import VitrinaBbva from '@/components/bbva/VitrinaBbva';
import { meta, migas } from '@/lib/seo';

const descripcion = 'Consulta con tu DNI qué tarjetas de crédito BBVA tienes preaprobadas, con su línea de crédito y tasa, y solicítalas directamente con BBVA. Fimav Perú, aliado BBVA.';
export const metadata = meta('Tarjetas de crédito BBVA', descripcion, '/tarjetas-bbva');

const PASOS = [
  { icono: IdCard, etiqueta: 'Menos de 1 minuto', titulo: 'Ingresa tus datos', texto: 'DNI, fecha de nacimiento, celular y correo.' },
  { icono: BadgeCheck, etiqueta: 'Al instante', titulo: 'BBVA evalúa tu perfil', texto: 'Te muestra las tarjetas que tienes disponibles.' },
  { icono: MousePointerClick, etiqueta: 'Tú decides', titulo: 'Elige tu tarjeta', texto: 'Compara línea de crédito y tasa, y elige la que prefieras.' },
  { icono: CreditCard, etiqueta: 'Web o app de BBVA', titulo: 'Solicítala con BBVA', texto: 'Terminas la solicitud directamente con el banco.' },
];

/* Tarjetas BBVA: formulario de consulta (API Cards offer de BBVA vía la API central), cómo funciona y vitrina. */
export default function TarjetasBbvaPage() {
  return (
    <main id="contenido">
      <JsonLd datos={migas([{ nombre: 'Tarjetas BBVA', ruta: '/tarjetas-bbva' }])} />
      <BannerPagina eyebrow="Aliado BBVA" titulo="Tarjetas de crédito" resaltado="BBVA" miga="Tarjetas BBVA" />

      <section id="consulta" className="scroll-mt-24 bg-gris py-16 lg:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
          <Reveal>
            <SeccionTitulo nivel="h2" tam="md" eyebrow="Preaprobadas para ti" claro="Descubre qué tarjeta" rojo="tienes disponible" />
            <p className="mt-6 max-w-xl leading-relaxed text-carbon/80">
              Consulta con tu DNI en menos de un minuto y mira las tarjetas de crédito que BBVA tiene para ti, con su línea de crédito y tasa. Sin costo y sin papeleo.
            </p>
            <div className="relative mt-8 overflow-hidden rounded-3xl bg-gradient-to-br from-[#070E46] via-[#001391] to-[#004481] px-6 pb-4 pt-6 text-white">
              <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-[#85C8FF]/25 blur-3xl" />
              <LogoBbva blanco className="relative h-5" />
              <AbanicoBbva className="relative mx-auto mt-2 w-full max-w-xs" />
            </div>
          </Reveal>
          <Reveal retraso={120}>
            <FormBbva />
          </Reveal>
        </div>
      </section>

      <section id="como-funciona" className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <SeccionTitulo nivel="h2" tam="md" eyebrow="Cuatro pasos, sin papeleo" claro="¿Cómo" rojo="funciona?" />
            <p className="mt-6 max-w-2xl leading-relaxed text-carbon/80">Consultas aquí en un minuto y terminas tu solicitud directamente con BBVA.</p>
          </Reveal>
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PASOS.map((p, i) => (
              <Reveal as="li" key={p.titulo} retraso={i * 90} className="rounded-2xl bg-gris p-6">
                <Hexagono icono={p.icono} tam={56} />
                <p className="mt-4 font-display text-sm font-semibold uppercase tracking-[0.16em] text-rojo-hondo">Paso {i + 1} · {p.etiqueta}</p>
                <h3 className="titulo-menor mt-1 text-xl text-carbon">{p.titulo}</h3>
                <p className="mt-2 leading-relaxed text-carbon/80">{p.texto}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section id="tarjetas" className="scroll-mt-24 bg-gris py-16 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <SeccionTitulo nivel="h2" tam="md" eyebrow="De la primera a la más exclusiva" claro="Conoce las tarjetas" rojo="que puedes obtener" />
            <p className="mt-6 max-w-2xl leading-relaxed text-carbon/80">BBVA te dirá cuáles tienes preaprobadas según tu perfil.</p>
          </Reveal>
          <Reveal className="mt-8"><VitrinaBbva /></Reveal>
          <p className="mt-10 max-w-3xl text-sm leading-relaxed text-carbon/80">
            Las ofertas, líneas de crédito y tasas las define BBVA Perú según tu evaluación crediticia y están sujetas a su aprobación final. Fimav Perú solo facilita la consulta; la contratación se realiza directamente con BBVA.
          </p>
        </div>
      </section>
    </main>
  );
}
