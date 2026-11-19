import type { CSSProperties } from "react";
import Enlace from "@/components/Enlace";
import Reveal from "@/components/Reveal";
import Contador from "@/components/Contador";
import { Chevrones, Cta, Fondo, Hex, Icono, Seccion, Titulo } from "@/components/ui";
import { MARCAS, MOTIVOS, PERU_COMPRAS, PRODUCTOS, PROYECTOS, SERVICIOS } from "@/lib/datos";

const d = (ms: number) => ({ ["--d" as string]: `${ms}ms` }) as CSSProperties;

export default function Inicio() {
  return (
    <>
      {/* ---------- Portada ---------- */}
      <section className="malla relative overflow-hidden px-5 pb-24 pt-36 sm:pt-44">
        <div className="cuadricula absolute inset-0" aria-hidden />
        <Fondo />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <span className="etiqueta entra" style={d(1800)}><Icono n="estrella" className="h-4 w-4" /> Proveedor en Perú Compras</span>
            <h1 className="titulo entra mt-6 text-5xl sm:text-6xl xl:text-7xl" style={d(1900)}>
              Soluciones tecnológicas para el <b>crecimiento empresarial</b>
            </h1>
            <p className="entra mt-7 max-w-xl text-lg leading-relaxed text-grafito/80" style={d(2000)}>
              No nos limitamos a vender productos: nos convertimos en tu socio estratégico. Equipos de cómputo, redes, servidores, cableado y soporte, de principio a fin.
            </p>
            <div className="entra mt-9 flex flex-wrap gap-4" style={d(2100)}>
              <Enlace href="/contacto/" className="btn btn-naranja">Solicitar cotización <Icono n="flecha" className="h-5 w-5" /></Enlace>
              <Enlace href="/servicios/" className="btn btn-linea">Ver servicios</Enlace>
            </div>
            <Chevrones className="entra mt-12" />
          </div>

          <div className="entra relative mx-auto aspect-square w-full max-w-[34rem]" style={d(2000)}>
            <div className="gira absolute inset-0 border-2 border-dashed border-azul-2/30" style={{ ["--t" as string]: "60s" } as CSSProperties} />
            <div className="hex absolute inset-[6%] bg-azul-2" />
            <div className="hex absolute inset-[10%] bg-white" />
            <div className="absolute inset-[6%] bg-naranja" style={{ clipPath: "polygon(7% 75%, 50% 100%, 93% 75%, 93% 68%, 50% 90%, 7% 68%)" }} />
            <img src="/img/laptop.webp" alt="Asesora de Company IMC presentando una laptop" className="absolute inset-x-[6%] bottom-[7%] top-[2%] h-[91%] w-[88%] object-contain object-bottom drop-shadow-2xl" />
            <div className="flota tarjeta absolute -left-2 top-[18%] flex items-center gap-3 px-4 py-3" style={{ ["--t" as string]: "6s" } as CSSProperties}>
              <span className="hex flex h-11 w-11 items-center justify-center bg-naranja"><Icono n="check" className="h-5 w-5 text-tinta" /></span>
              <span className="text-sm font-bold leading-tight text-tinta">+4 años<br /><span className="font-medium text-grafito/70">de experiencia</span></span>
            </div>
            <div className="flota tarjeta absolute -right-2 bottom-[22%] flex items-center gap-3 px-4 py-3" style={{ ["--t" as string]: "7s", ["--dl" as string]: "-3s" } as CSSProperties}>
              <span className="hex flex h-11 w-11 items-center justify-center bg-azul-2"><Icono n="equipo" className="h-5 w-5 text-white" /></span>
              <span className="text-sm font-bold leading-tight text-tinta">Soporte técnico<br /><span className="font-medium text-grafito/70">continuo</span></span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Marcas ---------- */}
      <section className="marquesina-caja overflow-hidden bg-azul-osc py-6 text-white" aria-label="Marcas con las que trabajamos">
        <div className="marquesina flex gap-14 whitespace-nowrap">
          {[...MARCAS, ...MARCAS].map((m, i) => (
            <span key={i} className="flex items-center gap-14 text-2xl font-extrabold tracking-tight text-white/85">
              {m}<span className="hex h-3 w-3 bg-naranja" />
            </span>
          ))}
        </div>
      </section>

      {/* ---------- Cifras ---------- */}
      <Seccion className="bg-white !py-16 sm:!py-20">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {[
            [4, "+", "años de experiencia"],
            [5, "", "líneas de tecnología"],
            [2, "", "servicios de proyectos"],
            [6, "", "categorías de productos"],
          ].map(([n, p, t], i) => (
            <Reveal key={t as string} delay={i * 110} className="text-center">
              <div className="titulo text-5xl text-azul-2 sm:text-6xl"><span className="text-naranja">{p === "+" ? "+" : ""}</span><Contador hasta={n as number} />{p === "%" ? "%" : ""}</div>
              <p className="mt-2 text-sm font-semibold uppercase tracking-widest text-grafito/60">{t}</p>
            </Reveal>
          ))}
        </div>
      </Seccion>

      {/* ---------- Servicios ---------- */}
      <Seccion className="bg-azul-claro">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal><Titulo a="Nuestros" b="servicios" /></Reveal>
          <Reveal dir="der"><Enlace href="/servicios/" className="btn btn-linea">Todos los servicios <Icono n="flecha" className="h-5 w-5" /></Enlace></Reveal>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {PROYECTOS.map((p, i) => (
            <Reveal key={p.t} delay={i * 120}>
              <Enlace href="/servicios/" className="tarjeta group relative block h-80 overflow-hidden">
                <img src={p.img} alt={p.t} className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-[var(--ease-salida)] group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-azul-osc via-azul-osc/50 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-7 text-white">
                  <div><h3 className="text-2xl font-extrabold uppercase leading-tight">{p.t}</h3><p className="mt-1 max-w-sm text-sm text-white/80">{p.d}</p></div>
                  <span className="insignia hex h-14 w-14 shrink-0 !bg-naranja !text-tinta"><Icono n="flecha" className="h-6 w-6" /></span>
                </div>
              </Enlace>
            </Reveal>
          ))}
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {SERVICIOS.map((s, i) => (
            <Reveal key={s.t} delay={i * 80}>
              <div className="tarjeta h-full p-6 text-center">
                <Hex n={s.n} size="h-20 w-20" />
                <h3 className="mt-4 text-sm font-extrabold uppercase tracking-wide text-azul-osc">{s.t}</h3>
              </div>
            </Reveal>
          ))}
        </div>
      </Seccion>

      {/* ---------- Productos ---------- */}
      <Seccion className="bg-white">
        <Reveal><Titulo a="Nuestros" b="productos" /></Reveal>
        <div className="mt-14 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {PRODUCTOS.map((p, i) => (
            <Reveal key={p.t} delay={i * 100}>
              <Enlace href="/productos/" className="tarjeta grupo group flex h-full flex-col items-center p-6">
                <div className="flex h-40 w-full items-center justify-center">
                  <img src={p.img} alt={p.t} className="max-h-full w-auto max-w-full object-contain transition-transform duration-700 ease-[var(--ease-salida)] group-hover:-translate-y-2 group-hover:scale-110" />
                </div>
                <h3 className="mt-5 text-lg font-extrabold uppercase tracking-tight text-tinta">{p.t}</h3>
                <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-azul-2 opacity-0 transition group-hover:opacity-100">Ver más <Icono n="flecha" className="h-4 w-4" /></span>
              </Enlace>
            </Reveal>
          ))}
        </div>
      </Seccion>

      {/* ---------- Perú Compras ---------- */}
      <section className="oscuro degradado-azul relative overflow-hidden px-5 py-20 text-white sm:py-28">
        <div className="cuadricula-claro absolute inset-0" aria-hidden />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2">
          <div>
            <Reveal>
              <h2 className="titulo text-4xl sm:text-5xl">Estamos en <span className="text-naranja">Perú Compras</span></h2>
              <div className="regla mt-5" />
            </Reveal>
            <ul className="mt-10 space-y-7">
              {PERU_COMPRAS.map((p, i) => (
                <Reveal key={p.t} delay={i * 120} dir="izq">
                  <li className="grupo flex items-center gap-5">
                    <Hex n={p.n} size="h-16 w-16" icon="h-7 w-7" />
                    <div><h3 className="text-xl font-bold">{p.t}</h3><p className="text-white/70">{p.d}</p></div>
                  </li>
                </Reveal>
              ))}
            </ul>
            <Reveal delay={300}><Enlace href="/peru-compras/" className="btn btn-naranja mt-10">Conoce más <Icono n="flecha" className="h-5 w-5" /></Enlace></Reveal>
          </div>
          <Reveal dir="der">
            <div className="relative">
              <div className="absolute -inset-4 rotate-3 bg-naranja/90" aria-hidden />
              <img src="/img/perucompras.webp" alt="Sede de Perú Compras" className="relative aspect-[4/3] w-full object-cover shadow-2xl" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- Por qué ---------- */}
      <Seccion className="bg-white">
        <div className="grid items-center gap-14 lg:grid-cols-[.9fr_1.1fr]">
          <Reveal dir="izq">
            <div className="relative mx-auto max-w-md">
              <div className="hex absolute inset-0 scale-105 bg-azul-2" />
              <div className="hex absolute inset-[5%] bg-azul-claro" />
              <img src="/img/asesora.webp" alt="Asesora de Company IMC" className="hex relative aspect-square w-full scale-[.9] object-cover object-[40%_20%]" />
              <div className="flota absolute -bottom-3 right-0 h-20 w-20 bg-naranja hex" />
            </div>
          </Reveal>
          <div>
            <Reveal><Titulo a="¿Por qué" b="escogernos?" /></Reveal>
            <Reveal delay={100}><p className="mt-8 text-2xl font-medium italic leading-snug text-tinta">Entendemos que cada empresa es única y enfrenta desafíos específicos. Por eso, nos convertimos en tu socio estratégico.</p></Reveal>
            <ul className="mt-8 space-y-4">
              {MOTIVOS.map((m, i) => (
                <Reveal key={m} delay={i * 90}>
                  <li className="grupo flex gap-4"><span className="insignia h-8 w-8 shrink-0"><Icono n="check" className="h-5 w-5" /></span><p className="leading-relaxed">{m}</p></li>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </Seccion>

      <Cta />
    </>
  );
}
