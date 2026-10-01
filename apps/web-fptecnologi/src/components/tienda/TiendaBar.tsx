import { Home } from 'lucide-react';
import { StickyNav } from '@/components/home/StickyNav';
import { Navbar9 } from '@/components/home/Navbar9';

/* Franja corta de la tienda (mismo marco y degradado que la ficha de producto):
   el encabezado fijo es claro y necesita fondo oscuro detrás. Migas de pan + título. */
export function TiendaBar({ crumbs, titulo }: { crumbs: { label: string; href?: string }[]; titulo: string }) {
  return (
    <>
      <StickyNav store />
      <div className="bg-paper p-3 md:p-5">
        <section className="relative overflow-hidden rounded-[1.25rem] text-white md:rounded-[2.25rem]">
          <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-ink via-brand-primary to-brand-dark" />
          <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand-teal/30 blur-3xl" />
          <div className="invisible" aria-hidden>
            <Navbar9 store />
          </div>
          <div className="relative mx-auto max-w-7xl px-6 pb-8 pt-2 md:px-10">
            <nav aria-label="Migas de pan" className="relative flex w-fit flex-wrap items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-sm text-white/75 backdrop-blur-md">
              <span className="spin-border spin-border--thin" aria-hidden />
              <a href="/" className="relative flex items-center gap-1.5 hover:text-white">
                <Home className="h-4 w-4 text-white" strokeWidth={2} />
                Inicio
              </a>
              {crumbs.map((c) => (
                <span key={c.label} className="relative flex items-center gap-2">
                  <span className="text-white/40">/</span>
                  {c.href ? (
                    <a href={c.href} className="hover:text-white">{c.label}</a>
                  ) : (
                    <span className="font-semibold text-white">{c.label}</span>
                  )}
                </span>
              ))}
            </nav>
            <h1 className="relative mt-5 font-display text-3xl font-bold sm:text-4xl">{titulo}</h1>
          </div>
        </section>
      </div>
    </>
  );
}
