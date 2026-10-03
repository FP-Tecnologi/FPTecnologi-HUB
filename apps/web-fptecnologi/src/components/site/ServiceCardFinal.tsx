import { Icon } from '@/components/site/Icon';
import type { SOLUTIONS } from '@/lib/content';

/**
 * Tarjeta de servicio final -- elegida por el usuario a partir de
 * site4/Services4.tsx, con 3 agregados que esa versión no tenía:
 * badge ("tag") antes del título, descripción a 2 líneas, y botón "Más
 * información" que redirige al detalle real del servicio (en vez de que
 * toda la tarjeta sea un solo link a #contacto).
 */
export function ServiceCardFinal({ item }: { item: (typeof SOLUTIONS)[number] }) {
  return (
    <div className="group overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl">
      <div className="relative h-40 overflow-hidden">
        <img src={item.image} alt={item.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <span className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-lg bg-brand-primary text-white shadow-lg transition-colors duration-300 group-hover:bg-white group-hover:text-brand-700">
          <Icon name={item.icon} className="h-5 w-5" />
        </span>
      </div>
      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">{item.tag}</p>
        <h3 className="mt-1 text-base font-semibold text-ink">{item.title}</h3>
        <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-sm text-ink/65">{item.description}</p>
        <a href={`/servicios/${item.slug}`} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-dark">
          Más información
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
    </div>
  );
}
