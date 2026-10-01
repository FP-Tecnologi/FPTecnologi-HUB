import type { ReactNode } from 'react';
import { StickyNav } from '@/components/home/StickyNav';
import { Navbar9 } from '@/components/home/Navbar9';
import { ParticlesBackground } from '@/components/home/ParticlesBackground';
import { Home } from 'lucide-react';

/*
 * Portada de páginas internas (Nosotros, Servicios, Contacto...) con el mismo
 * estilo del banner de la home (Hero.tsx): tarjeta redondeada sobre paper con
 * video o foto de fondo, velo oscuro + degradé central, partículas, etiqueta
 * de vidrio con contorno que gira, título grande en dos líneas (blanca + con
 * brillo) y botones, todo centrado. Alto según el contenido (como la tienda), no
 * pantalla completa. `children` = botones.
 */
export function PageHero({
  crumbs,
  titulo,
  destacado,
  descripcion,
  imagen = '/images/modelo9/hero-office.jpg',
  video,
  children,
}: {
  crumbs: { label: string; href: string }[];
  /** Ya no se muestra (las migas de pan hacen de etiqueta); se deja por compatibilidad. */
  badge?: string;
  titulo: string;
  destacado?: string;
  descripcion?: string;
  imagen?: string;
  video?: string;
  children?: ReactNode;
}) {
  return (
    <>
      <StickyNav />
      <div className="bg-paper p-3 md:p-5">
        <section className="relative flex w-full flex-col overflow-hidden rounded-[1.25rem] bg-brand-primary md:rounded-[2.25rem]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imagen} alt="" aria-hidden className="absolute inset-0 z-0 h-full w-full object-cover" />
          {video && (
            <video autoPlay muted loop playsInline preload="auto" poster={imagen} aria-hidden className="absolute inset-0 z-0 h-full w-full object-cover">
              <source src={video} type="video/mp4" />
            </video>
          )}
          <div className="absolute inset-0 z-[1] bg-brand-primary/80" />
          <div className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_60%_50%_at_50%_45%,rgba(0,0,0,0.35),transparent)]" />
          <div className="absolute inset-0 z-[2]">
            <ParticlesBackground />
          </div>

          <div className="relative z-10 flex w-full flex-1 flex-col">
            <div className="invisible w-full" aria-hidden>
              <Navbar9 />
            </div>

            <div className="flex flex-1 flex-col items-center justify-center px-6 pb-14 pt-6 text-center">
              {/* Migas de pan = etiqueta: cápsula de vidrio con el contorno que
                  gira (mismo efecto del badge del banner), casita de Inicio y
                  la ruta hasta esta página -- así el nombre no se repite. */}
              <nav
                aria-label="Migas de pan"
                className="v9-appear v9-appear--up relative mx-auto mb-4 flex w-fit flex-wrap items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-sm text-white/75 backdrop-blur-md"
              >
                <span className="spin-border spin-border--thin" aria-hidden />
                {crumbs.map((c, i) => (
                  <span key={c.href} className="relative flex items-center gap-2">
                    {i > 0 && <span className="text-white/40">/</span>}
                    {i === 0 ? (
                      <a href={c.href} className="flex items-center gap-1.5 transition-colors hover:text-white">
                        <Home className="h-4 w-4 text-white" strokeWidth={2} />
                        {c.label}
                      </a>
                    ) : i === crumbs.length - 1 ? (
                      <span className="font-semibold text-white">{c.label}</span>
                    ) : (
                      <a href={c.href} className="transition-colors hover:text-white">
                        {c.label}
                      </a>
                    )}
                  </span>
                ))}
              </nav>

              <h1
                className="v9-appear v9-appear--scale mx-auto mb-3 max-w-4xl text-4xl font-normal leading-[1.08] tracking-tight text-white sm:text-5xl 2xl:text-6xl"
                style={{ animationDelay: '150ms', textShadow: '0 4px 30px rgba(0,0,0,0.45)' }}
              >
                <span className="block">{titulo}</span>
                {destacado && <span className="hero-title-shimmer block">{destacado}</span>}
              </h1>

              {descripcion && (
                <p
                  className="v9-appear v9-appear--fade mx-auto max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base md:text-lg"
                  style={{ animationDelay: '300ms', textShadow: '0 2px 16px rgba(0,0,0,0.4)' }}
                >
                  {descripcion}
                </p>
              )}

              {children && (
                <div className="v9-appear v9-appear--up mt-6 flex flex-wrap items-center justify-center gap-3" style={{ animationDelay: '450ms' }}>
                  {children}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
