'use client';

import {
  ArrowUpRight,
  BadgeCheck,
  BookMarked,
  BookOpen,
  Building2,
  ChevronRight,
  FileText,
  GraduationCap,
  Handshake,
  Info,
  Laptop,
  LifeBuoy,
  Mail,
  MapPin,
  MapPinned,
  MessageSquare,
  Newspaper,
  Phone,
  ReceiptText,
  Scale,
  ShieldCheck,
  ShoppingCart,
  Store,
  UserRound,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';
import { WhatsAppIcon } from './icons';
import type { ChatAction } from '@/lib/chatActions';
import type { DatosChat, ServicioChat } from '@/lib/chatCotizacion';

/*
 * Tarjetas del asistente virtual: servicios (con foto), páginas de la web (ícono + descripción), datos puntuales
 * (tabla corta) y botones de contacto con su color. Todo sale de datos validados en el servidor (app/api/chat): la IA
 * solo elige IDs, nunca escribe URLs.
 */

const margen = 'ml-9 w-[calc(100%-2.25rem)] max-w-sm';

/** Ícono y color de cada página según su ruta. */
const PAGINAS: { prefijo: string; icono: LucideIcon; tono: string }[] = [
  { prefijo: '/servicios', icono: Wrench, tono: 'bg-sky-100 text-sky-700' },
  { prefijo: '/tienda', icono: Store, tono: 'bg-brand-100 text-brand-700' },
  { prefijo: '/cotizador', icono: FileText, tono: 'bg-violet-100 text-violet-700' },
  { prefijo: '/alquiler-equipos', icono: Laptop, tono: 'bg-cyan-100 text-cyan-700' },
  { prefijo: '/educacion', icono: GraduationCap, tono: 'bg-amber-100 text-amber-700' },
  { prefijo: '/compliance', icono: ShieldCheck, tono: 'bg-emerald-100 text-emerald-700' },
  { prefijo: '/catalogos', icono: BookOpen, tono: 'bg-orange-100 text-orange-700' },
  { prefijo: '/tickets', icono: LifeBuoy, tono: 'bg-rose-100 text-rose-700' },
  { prefijo: '/cuenta', icono: UserRound, tono: 'bg-indigo-100 text-indigo-700' },
  { prefijo: '/socios', icono: Handshake, tono: 'bg-teal-100 text-teal-700' },
  { prefijo: '/carrito', icono: ShoppingCart, tono: 'bg-brand-100 text-brand-700' },
  { prefijo: '/presupuesto', icono: ReceiptText, tono: 'bg-violet-100 text-violet-700' },
  { prefijo: '/marcas', icono: BadgeCheck, tono: 'bg-sky-100 text-sky-700' },
  { prefijo: '/nosotros', icono: Building2, tono: 'bg-slate-100 text-slate-700' },
  { prefijo: '/proyectos', icono: MapPinned, tono: 'bg-emerald-100 text-emerald-700' },
  { prefijo: '/blog', icono: Newspaper, tono: 'bg-pink-100 text-pink-700' },
  { prefijo: '/contacto', icono: MessageSquare, tono: 'bg-brand-100 text-brand-700' },
  { prefijo: '/legal', icono: Scale, tono: 'bg-slate-100 text-slate-700' },
  { prefijo: '/libro-de-reclamaciones', icono: BookMarked, tono: 'bg-rose-100 text-rose-700' },
];
const PAGINA_BASE = { icono: ArrowUpRight, tono: 'bg-brand-100 text-brand-700' };
const paginaDe = (href: string) => PAGINAS.find((p) => href === p.prefijo || href.startsWith(`${p.prefijo}/`) || href.startsWith(`${p.prefijo}?`)) ?? PAGINA_BASE;

/** Botones de contacto: cada canal con su color. */
const CONTACTO: Record<'whatsapp' | 'maps' | 'email' | 'phone', { icono: LucideIcon | typeof WhatsAppIcon; clase: string }> = {
  whatsapp: { icono: WhatsAppIcon, clase: 'bg-whatsapp text-white shadow-whatsapp/30 hover:bg-whatsapp-dark' },
  maps: { icono: MapPin, clase: 'bg-rose-500 text-white shadow-rose-500/30 hover:bg-rose-600' },
  email: { icono: Mail, clase: 'bg-brand-700 text-white shadow-brand-700/30 hover:bg-brand-800' },
  phone: { icono: Phone, clase: 'bg-ink text-white shadow-ink/30 hover:bg-ink/85' },
};

export function ChatServicios({ servicios }: { servicios: ServicioChat[] }) {
  const { format } = useCurrency();
  const uno = servicios.length === 1;
  return (
    <ul
      aria-label="Servicios sugeridos"
      className={`animate-pop-in ${margen} flex gap-2 ${uno ? '' : '-mr-1 snap-x snap-mandatory overflow-x-auto pb-1.5 pr-1 [scrollbar-width:thin]'}`}
    >
      {servicios.map((s) => (
        <li key={s.slug} className={uno ? 'w-full' : 'w-[78%] shrink-0 snap-start'}>
          <a href={s.href} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-sm shadow-brand-950/5 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-950/10">
            <span className="relative block h-24 overflow-hidden bg-brand-primary">
              {s.imagen && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.imagen} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              )}
              <span className="absolute inset-0 bg-gradient-to-t from-brand-950/75 via-brand-950/20 to-transparent" />
              {s.etiqueta && (
                <span className="absolute left-2.5 top-2.5 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-700">{s.etiqueta}</span>
              )}
              <span className="absolute bottom-2 left-3 right-3 line-clamp-2 font-display text-sm font-bold leading-tight text-white">{s.titulo}</span>
            </span>
            <span className="flex flex-1 flex-col p-3">
              <span className="mb-2.5 line-clamp-3 text-xs leading-relaxed text-ink/70">{s.descripcion}</span>
              <span className="mt-auto flex items-center justify-between gap-2 border-t border-brand-50 pt-2 text-[11px]">
                <span className="truncate font-semibold text-ink/80">{s.precioDesde ? `Desde ${format(s.precioDesde)}` : 'Se cotiza por proyecto'}</span>
                <span className="inline-flex shrink-0 items-center gap-0.5 whitespace-nowrap font-semibold text-brand-700">
                  Ver más <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2.2} />
                </span>
              </span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export function ChatDatos({ datos }: { datos: DatosChat }) {
  return (
    <div className={`animate-pop-in ${margen} overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-sm shadow-brand-950/5`}>
      <p className="flex items-center gap-2 bg-gradient-to-r from-brand-50 to-white px-3.5 py-2 text-xs font-bold uppercase tracking-wide text-brand-700">
        <Info className="h-3.5 w-3.5" strokeWidth={2.2} />
        {datos.titulo}
      </p>
      <dl className="divide-y divide-brand-50 px-3.5">
        {datos.filas.map((f) => (
          <div key={f.etiqueta} className="flex gap-3 py-2 text-xs">
            <dt className="w-[38%] shrink-0 font-semibold text-ink/60">{f.etiqueta}</dt>
            <dd className="min-w-0 flex-1 font-medium text-ink">{f.valor}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Páginas como tarjetas (ícono + título + descripción) y canales de contacto como botones de color. */
export function ChatEnlaces({ acciones }: { acciones: ChatAction[] }) {
  const paginas = acciones.filter((a) => a.kind === 'page');
  const contacto = acciones.filter((a): a is ChatAction & { kind: keyof typeof CONTACTO } => a.kind !== 'page');
  return (
    <div className={`animate-pop-in ${margen} flex flex-col gap-1.5`}>
      {paginas.map((a) => {
        const { icono: Icono, tono } = paginaDe(a.href);
        return (
          <a
            key={a.href}
            href={a.href}
            className="group flex items-center gap-3 rounded-xl border border-brand-100 bg-white p-2.5 shadow-sm shadow-brand-950/5 transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
          >
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:-rotate-6 group-hover:scale-105 ${tono}`}>
              <Icono className="h-4.5 w-4.5" strokeWidth={2} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-ink group-hover:text-brand-700">{a.label}</span>
              {a.desc && <span className="block truncate text-[11px] text-ink/60">{a.desc}</span>}
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-ink/35 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-700" strokeWidth={2} />
          </a>
        );
      })}
      {contacto.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {contacto.map((a) => {
            const { icono: Icono, clase } = CONTACTO[a.kind];
            const externo = a.href.startsWith('http');
            return (
              <a
                key={a.href}
                href={a.href}
                target={externo ? '_blank' : undefined}
                rel={externo ? 'noreferrer' : undefined}
                className={`inline-flex max-w-full items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-md transition-all hover:-translate-y-0.5 active:scale-95 ${clase}`}
              >
                <Icono className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{a.label}</span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
