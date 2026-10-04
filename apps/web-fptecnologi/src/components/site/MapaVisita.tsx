import { Car, Clock, MapPin, Navigation, type LucideIcon } from 'lucide-react';
import { MoreInfoButton } from '@/components/home/MoreInfoButton';
import { ScrollReveal } from '@/components/home/ScrollReveal';
import { SectionBadge } from '@/components/home/SectionBadge';

type Opcion = { nombre: string; href: string; icono: LucideIcon };

// Nombre del negocio tal como figura en Google Maps.
const NEGOCIO = 'FP Tecnologi & System SAC';

/* Visítanos: mapa a la izquierda y tarjeta con dirección y horario a la derecha.
   - Mapa: un pin animado (aro que pulsa) marca el punto exacto de la dirección y, al pasar el
     cursor, aparece una barra con opciones para abrir la ruta (Google Maps, Waze, Apple Maps, Uber).
   - Tarjeta: cada dato lleva su ícono, que salta y gira al hover (efecto icon-hop). */
export function MapaVisita({ address, horario, badge, titulo, destacado }: { address: string; horario: string; badge: string; titulo: string; destacado: string }) {
  const q = encodeURIComponent(address);
  // Buscar por nombre del negocio + dirección: Google centra el mapa en su ficha, pone el pin y muestra la tarjeta en la esquina.
  const embed = `https://www.google.com/maps?q=${encodeURIComponent(`${NEGOCIO}, ${address}`)}&z=17&output=embed`;
  const opciones: Opcion[] = [
    { nombre: 'Google Maps', href: `https://www.google.com/maps/search/?api=1&query=${q}`, icono: MapPin },
    { nombre: 'Waze', href: `https://waze.com/ul?q=${q}&navigate=yes`, icono: Navigation },
    { nombre: 'Apple Maps', href: `https://maps.apple.com/?q=${q}`, icono: MapPin },
    { nombre: 'Uber', href: `https://m.uber.com/ul/?action=setPickup&dropoff[formatted_address]=${q}`, icono: Car },
  ];

  const datos = [
    { Icono: MapPin, etiqueta: 'Dirección', valor: address },
    { Icono: Clock, etiqueta: 'Horario de atención', valor: horario },
  ];

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
        <ScrollReveal direction="left">
          <div className="group relative overflow-hidden rounded-2xl shadow-2xl shadow-brand-950/20 ring-2 ring-transparent transition-shadow duration-500 hover:ring-brand-primary/60">
            <iframe title="Ubicación de FPTecnologi" src={embed} className="h-[440px] w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            {/* Aviso inicial: desaparece al pasar el cursor (en táctil no se muestra). */}
            <span className="pointer-events-none absolute right-3 top-3 hidden items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-brand-700 shadow-lg shadow-brand-950/20 transition-opacity duration-300 [@media(hover:hover)]:flex group-hover:opacity-0">
              <Navigation className="h-3.5 w-3.5" strokeWidth={2.2} />
              Pasa el cursor para ver rutas
            </span>
            {/* Opciones de ruta: suben al pasar el cursor (en táctil quedan visibles). */}
            <div className="absolute inset-x-3 bottom-3 rounded-2xl bg-white p-3 shadow-2xl shadow-brand-950/30 ring-1 ring-brand-100 transition-all duration-500 ease-out [@media(hover:hover)]:translate-y-[125%] [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100">
              <p className="flex items-center gap-2 px-1 pb-2 text-xs font-bold uppercase tracking-widest text-brand-700">
                <span aria-hidden className="h-0.5 w-5 rounded-full bg-brand-primary" />
                Cómo llegar con
              </p>
              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {opciones.map(({ nombre, href, icono: Icono }) => (
                  <li key={nombre}>
                    <a href={href} target="_blank" rel="noreferrer" className="group/op flex flex-col items-center gap-1.5 rounded-xl border border-brand-100 bg-paper px-2 py-3 text-sm font-semibold text-ink transition-all duration-300 hover:-translate-y-1 hover:border-brand-primary hover:bg-brand-primary hover:text-white hover:shadow-[0_12px_24px_-8px_rgba(16,122,204,0.6)]">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-brand-primary shadow-sm transition-all duration-300 group-hover/op:scale-110 group-hover/op:-rotate-6">
                        <Icono className="icon-hop h-4.5 w-4.5" strokeWidth={2} />
                      </span>
                      {nombre}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="right" delayMs={120} className="h-full">
          <div className="flex h-full flex-col gap-5 rounded-2xl border border-brand-100 bg-white p-7 shadow-lg shadow-brand-950/10">
            <div>
              <SectionBadge>{badge}</SectionBadge>
              <h2 className="mt-2 font-display text-2xl font-bold leading-tight">
                <span className="text-ink">{titulo}</span> <span className="title-shimmer-light">{destacado}</span>
              </h2>
            </div>
            {datos.map(({ Icono, etiqueta, valor }) => (
              <div key={etiqueta} className="group flex items-start gap-4 rounded-xl border border-brand-100 bg-paper p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-primary/50 hover:bg-white hover:shadow-md hover:shadow-brand-primary/15">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-primary text-white transition-all duration-300 group-hover:-rotate-6 group-hover:scale-110">
                  <Icono className="icon-hop h-5 w-5" strokeWidth={1.8} />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs font-bold uppercase tracking-widest text-brand-700">{etiqueta}</span>
                  <span className="mt-0.5 block text-sm font-semibold leading-snug text-ink">{valor}</span>
                </span>
              </div>
            ))}
            <div className="mt-auto">
              <MoreInfoButton href={`https://www.google.com/maps/dir/?api=1&destination=${q}`} label="Cómo llegar" />
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
