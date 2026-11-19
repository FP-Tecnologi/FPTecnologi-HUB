import type { CSSProperties, ReactNode } from "react";
import Reveal from "./Reveal";
import Enlace from "./Enlace";

const ICONOS: Record<string, string> = {
  computo: "M3 4h13v10H3zM7 18h5M9.5 14v4M18 8h3v11h-3zM19.5 16.5h.01",
  impresion: "M7 9V3.5h10V9M7 17H4v-8h16v8h-3M7 13h10v7.5H7zM16.5 11h.01",
  red: "M12 3v6M12 9H5v4M12 9h7v4M3 13h4v5H3zM10 13h4v5h-4zM17 13h4v5h-4z",
  servidor: "M4 4h16v6H4zM4 12h16v6H4zM7.5 7h.01M7.5 15h.01M12 7h5M12 15h5M8 21h8",
  software: "M12 3l8 3v6c0 4.5-3.2 7.5-8 9-4.8-1.5-8-4.5-8-9V6zM8.5 12l2.5 2.5 4.5-5",
  cable: "M3 7h5v10H3zM16 7h5v10h-5zM8 12h8M5 4v3M5 17v3M18.5 4v3M18.5 17v3",
  telefono: "M5 3.5h4l1.8 4.6-2.4 1.6a11 11 0 0 0 5.9 5.9l1.6-2.4 4.6 1.8v4a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 3 5.7 2 2 0 0 1 5 3.5z",
  monitor: "M3 4h18v12H3zM8 20h8M12 16v4",
  proyector: "M3 7h18v9H3zM12 9.5a2.5 2.5 0 1 0 .01 0M6 16v2.5M18 16v2.5M6.5 10h.01",
  laptop: "M5 5h14v10H5zM2 19h20",
  megafono: "M3 10v4h3l8 4V6L6 10zM17.5 8.5a5 5 0 0 1 0 7",
  idea: "M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.6.5.6 1.2.6 1.7V16h6v-.5c0-.5 0-1.2.6-1.7A6 6 0 0 0 12 3z",
  grafico: "M4 20h17M7 20v-6M12 20V9M17 20V5M5 10l4-4 3 2.5L17 3",
  check: "M4 12.5l5 5L20 6.5",
  ubicacion: "M12 21s7-6 7-11.5a7 7 0 0 0-14 0C5 15 12 21 12 21zM12 7.5a2.5 2.5 0 1 0 .01 0",
  correo: "M3 6h18v12H3zM3.5 7l8.5 6.5L20.5 7",
  reloj: "M12 3a9 9 0 1 0 .01 0M12 7v5.5l3.5 2",
  flecha: "M5 12h14M13 6l6 6-6 6",
  equipo: "M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20M9.5 11a3.5 3.5 0 1 0 .01 0M21 20v-1.5a3.5 3.5 0 0 0-2.5-3.3M15.5 3.4a3.5 3.5 0 0 1 0 6.7",
  meta: "M12 3a9 9 0 1 0 .01 0M12 7.5a4.5 4.5 0 1 0 .01 0M12 12h.01",
  hoja: "M5 20c0-9 5-15 15-16 0 10-5 16-14 16M5 20l8-8",
  cartera: "M3 7h18v12H3zM8 7V4.5h8V7M3 12h18",
  estrella: "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z",
  menu: "M4 7h16M4 12h16M4 17h16",
  whatsapp: "M20 12a8 8 0 0 1-11.9 7L4 20l1.1-3.9A8 8 0 1 1 20 12zM9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.5-2-1-1 .8a4.5 4.5 0 0 1-2-2l.8-1-1-2z",
};

export function Icono({ n, className = "h-7 w-7" }: { n: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d={ICONOS[n] ?? ICONOS.check} />
    </svg>
  );
}

/** Hexágono con icono, como en el brochure. */
export function Hex({ n, size = "h-20 w-20", icon = "h-8 w-8" }: { n: string; size?: string; icon?: string }) {
  return (
    <span className={`insignia hex ${size}`}>
      <Icono n={n} className={icon} />
    </span>
  );
}

export function Chevrones({ className = "", claro = false }: { className?: string; claro?: boolean }) {
  return (
    <svg viewBox="0 0 220 40" className={`chev h-7 ${claro ? "text-white" : "text-azul-2"} ${className}`} aria-hidden>
      {Array.from({ length: 10 }).map((_, i) => (
        <path key={i} style={{ ["--i" as string]: i } as CSSProperties} d={`M${34 + i * 18} 2 L${12 + i * 18} 20 L${34 + i * 18} 38 L${42 + i * 18} 38 L${20 + i * 18} 20 L${42 + i * 18} 2 Z`} fill="currentColor" />
      ))}
    </svg>
  );
}

/** Hexágonos flotantes de fondo. */
export function Fondo({ claro = false }: { claro?: boolean }) {
  const base = claro ? "bg-white/10" : "bg-azul-2/10";
  const nar = claro ? "bg-naranja/30" : "bg-naranja/25";
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className={`flota hex absolute -left-16 top-24 h-56 w-56 ${base}`} style={{ ["--t" as string]: "9s" } as CSSProperties} />
      <div className={`flota hex absolute right-[8%] top-10 h-24 w-24 ${nar}`} style={{ ["--t" as string]: "6s", ["--dl" as string]: "-2s" } as CSSProperties} />
      <div className={`flota hex absolute bottom-12 left-[38%] h-16 w-16 ${nar}`} style={{ ["--t" as string]: "8s", ["--dl" as string]: "-4s" } as CSSProperties} />
      <div className={`flota hex absolute -right-20 bottom-0 h-72 w-72 ${base}`} style={{ ["--t" as string]: "11s", ["--dl" as string]: "-1s" } as CSSProperties} />
    </div>
  );
}

export function Titulo({ a, b, claro = false, centro = false }: { a: string; b?: string; claro?: boolean; centro?: boolean }) {
  return (
    <div className={centro ? "text-center" : ""}>
      <h2 className={`titulo ${claro ? "claro" : ""} text-4xl sm:text-5xl`}>
        {a} {b && <b>{b}</b>}
      </h2>
      <div className={`regla mt-5 ${centro ? "mx-auto" : ""}`} />
    </div>
  );
}

export function Seccion({ id, className = "", children }: { id?: string; className?: string; children: ReactNode }) {
  return (
    <section id={id} className={`relative scroll-mt-20 px-5 py-20 sm:py-28 ${className}`}>
      <div className="relative mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

/** Cabecera de páginas interiores. */
export function Portada({ etiqueta, a, b, texto, children }: { etiqueta: string; a: string; b: string; texto: string; children?: ReactNode }) {
  return (
    <section className="degradado-azul relative overflow-hidden px-5 pb-24 pt-40 text-white sm:pb-28 sm:pt-48">
      <div className="cuadricula-claro absolute inset-0 opacity-70" aria-hidden />
      <Fondo claro />
      <div className="relative mx-auto max-w-6xl">
        <div className="entra"><span className="etiqueta">{etiqueta}</span></div>
        <h1 className="titulo claro entra mt-5 max-w-3xl text-5xl sm:text-7xl" style={{ ["--d" as string]: "120ms" } as CSSProperties}>
          {a} <b>{b}</b>
        </h1>
        <p className="entra mt-6 max-w-2xl text-lg text-white/85" style={{ ["--d" as string]: "240ms" } as CSSProperties}>{texto}</p>
        {children && <div className="entra mt-8" style={{ ["--d" as string]: "360ms" } as CSSProperties}>{children}</div>}
        <Chevrones claro className="mt-10 opacity-80" />
      </div>
    </section>
  );
}

export function Cta() {
  return (
    <section className="px-5 pb-20 sm:pb-28">
      <Reveal dir="zoom" className="mx-auto max-w-6xl">
        <div className="degradado-azul relative overflow-hidden px-8 py-14 text-white sm:px-16 sm:py-20">
          <div className="cuadricula-claro absolute inset-0" aria-hidden />
          <Fondo claro />
          <div className="relative flex flex-wrap items-center justify-between gap-8">
            <div className="max-w-2xl">
              <h2 className="titulo claro text-3xl sm:text-5xl">¿Listo para tu próximo <b>proyecto tecnológico</b>?</h2>
              <p className="mt-4 text-lg text-white/80">Cuéntanos qué necesitas y te armamos una propuesta a medida de tu presupuesto y objetivos.</p>
            </div>
            <Enlace href="/contacto" className="btn btn-naranja">Solicitar cotización <Icono n="flecha" className="h-5 w-5" /></Enlace>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
