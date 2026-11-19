import type { CSSProperties } from "react";
import Enlace from "@/components/Enlace";
import Reveal from "@/components/Reveal";
import Contador from "@/components/Contador";
import Hero from "@/components/Hero";
import { Cta, Hex, Icono, Seccion, Titulo } from "@/components/ui";
import { MOTIVOS, PERU_COMPRAS, PRODUCTOS, PROYECTOS, SERVICIOS } from "@/lib/datos";

const d = (ms: number) => ({ ["--d" as string]: `${ms}ms` }) as CSSProperties;

export default function Inicio() {
  return (
    <>
      <Hero />

      {/* ---------- Sobre nosotros ---------- */}
      <Seccion className="bg-white">
        <div className="grid items-center gap-14 lg:grid-cols-[.85fr_1.15fr]">
          <Reveal dir="izq">
            <div className="relative mx-auto max-w-sm">
              <div className="hex absolute inset-0 scale-110 bg-naranja-claro" />
              <div className="hex flota absolute -bottom-4 -left-6 h-20 w-20 bg-azul-2" style={{ ["--t" as string]: "8s", ["--rot" as string]: "0deg" } as CSSProperties} />
              <img src="/img/hombre.webp" alt="Profesional de Company IMC" className="relative mx-auto h-[26rem] w-auto object-contain drop-shadow-xl" />
            </div>
          </Reveal>
          <div>
            <Reveal><Titulo a="Sobre" b="nosotros" /></Reveal>
            <Reveal delay={100}><p className="mt-8 text-2xl font-semibold italic leading-snug text-tinta">“Nos mantenemos a la vanguardia de la tecnología para ofrecer soluciones de última generación.”</p></Reveal>
            <Reveal delay={180}><p className="mt-5 leading-relaxed text-grafito/85">En Company IMC creemos en el poder de la tecnología para transformar negocios y mejorar vidas. Nos hemos consolidado como un socio estratégico para empresas de diversos sectores, con soluciones integrales que impulsan el crecimiento y la eficiencia.</p></Reveal>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                [4, "+", "años de experiencia"],
                [5, "", "líneas de tecnología"],
                [2, "", "servicios de proyectos"],
                [6, "", "categorías de productos"],
              ].map(([n, p, t], i) => (
                <Reveal key={t as string} delay={i * 100}>
                  <div className="tarjeta h-full p-4 text-center">
                    <div className="titulo text-4xl text-azul-2"><span className="text-naranja">{p}</span><Contador hasta={n as number} /></div>
                    <p className="mt-1 text-[11px] font-semibold uppercase leading-tight tracking-wider text-grafito/60">{t}</p>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={300}><Enlace href="/nosotros/" className="btn btn-azul mt-8">Conócenos <Icono n="flecha" className="h-5 w-5" /></Enlace></Reveal>
          </div>
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
              <img src="/img/perucompras.webp" alt="Palacio de Gobierno, Lima" className="relative aspect-[4/3] w-full object-cover shadow-2xl" />
              <div className="absolute bottom-5 left-5 w-44 bg-white p-3 shadow-xl"><img src="/img/perucompras-logo.webp" alt="Perú Compras" className="h-auto w-full" /></div>
              <p className="relative mt-7 text-right text-[11px] text-white/50">Foto: Wasiwatana, CC BY-SA 4.0 (Wikimedia Commons)</p>
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
