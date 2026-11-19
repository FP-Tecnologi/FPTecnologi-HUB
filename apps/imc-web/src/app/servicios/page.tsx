import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { meta, migas } from "@/lib/seo";
import Enlace from "@/components/Enlace";
import Reveal from "@/components/Reveal";
import { Cta, Hex, Icono, Portada, Seccion, Titulo } from "@/components/ui";
import { PASOS, PROYECTOS, SERVICIOS } from "@/lib/datos";

export const metadata: Metadata = meta("Servicios", "Cómputo, impresión, networking, servidores, software, cableado estructurado e implementación de centrales telefónicas.", "/servicios/");

export default function Servicios() {
  return (
    <>
      <JsonLd datos={migas("Servicios", "/servicios/")} />
      <Portada etiqueta="Qué hacemos" a="Nuestros" b="servicios" texto="Desde equipos de cómputo hasta cableado estructurado y telefonía: un portafolio completo para cubrir todas tus necesidades tecnológicas." />

      <Seccion className="bg-white">
        <div className="space-y-20">
          {PROYECTOS.map((p, i) => (
            <div key={p.t} className="grupo group grid items-center gap-10 lg:grid-cols-2">
              <Reveal dir={i % 2 ? "der" : "izq"} className={i % 2 ? "lg:order-2" : ""}>
                <div className="relative cursor-pointer">
                  <div className={`absolute -inset-3 bg-naranja/80 transition-transform duration-700 ease-[var(--ease-salida)] ${i % 2 ? "-rotate-2 group-hover:translate-x-3 group-hover:translate-y-3 group-hover:rotate-0" : "rotate-2 group-hover:-translate-x-3 group-hover:translate-y-3 group-hover:rotate-0"}`} aria-hidden />
                  <div className="relative aspect-[4/3] overflow-hidden shadow-xl transition-shadow duration-700 group-hover:shadow-2xl">
                    <img src={p.img} alt={p.t} className="h-full w-full object-cover transition-transform duration-[1400ms] ease-[var(--ease-salida)] group-hover:scale-110 group-hover:-rotate-1" />
                    <div className="absolute inset-0 bg-azul-osc/0 transition-colors duration-700 group-hover:bg-azul-osc/25" />
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 ease-[var(--ease-salida)] group-hover:translate-x-full" />
                    <span className="insignia hex absolute bottom-4 right-4 h-14 w-14 translate-y-4 !bg-naranja !text-tinta opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100"><Icono n="flecha" className="h-6 w-6" /></span>
                  </div>
                </div>
              </Reveal>
              <Reveal dir={i % 2 ? "izq" : "der"} delay={100}>
                <div>
                  <Hex n={p.n} size="h-20 w-20" />
                  <h2 className="titulo mt-6 text-3xl uppercase transition-colors duration-500 group-hover:text-azul-2 sm:text-4xl">{p.t}</h2>
                  <div className="regla mt-4 transition-[width] duration-700 ease-[var(--ease-salida)] group-hover:!w-48" />
                  <p className="mt-5 text-lg leading-relaxed text-grafito/80">{p.d}</p>
                </div>
              </Reveal>
            </div>
          ))}
        </div>
      </Seccion>

      <Seccion className="bg-azul-claro">
        <Reveal><Titulo a="Tecnología" b="para tu oficina" /></Reveal>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICIOS.map((s, i) => (
            <Reveal key={s.t} delay={i * 90}>
              <article className="tarjeta h-full p-8">
                <Hex n={s.n} size="h-20 w-20" />
                <h3 className="mt-5 text-lg font-extrabold uppercase tracking-wide text-azul-osc">{s.t}</h3>
                <p className="mt-2 leading-relaxed text-grafito/80">{s.d}</p>
              </article>
            </Reveal>
          ))}
          <Reveal delay={450}>
            <article className="degradado-azul puntos-claro flex h-full flex-col justify-between p-8 text-white">
              <h3 className="text-2xl font-extrabold leading-tight">¿No ves lo que buscas? Lo conseguimos.</h3>
              <Enlace href="/contacto/" className="btn btn-naranja mt-6 self-start">Escríbenos <Icono n="flecha" className="h-5 w-5" /></Enlace>
            </article>
          </Reveal>
        </div>
      </Seccion>

      <section className="relative overflow-hidden bg-white px-5 py-20 sm:py-28">
        <div className="cuadricula absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-6xl">
          <Reveal><Titulo a="Cómo" b="trabajamos" /></Reveal>
          <div className="mt-16 grid gap-10 md:grid-cols-4 md:gap-8">
            {PASOS.map((p, i) => (
              <Reveal key={p.t} delay={i * 160} className="h-full">
                <article className="grupo relative flex gap-5 md:block">
                  <span className="pointer-events-none absolute -bottom-6 right-0 select-none text-8xl font-extrabold leading-none text-azul-2/[.07]" aria-hidden>0{i + 1}</span>
                  <div className="relative z-10 h-20 w-20 shrink-0">
                    <span className="insignia hex h-20 w-20 !bg-azul-2 ring-0"><Icono n={p.n} className="h-8 w-8" /></span>
                    <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center bg-naranja text-xs font-extrabold text-tinta">{i + 1}</span>
                  </div>
                  {i < PASOS.length - 1 && (
                    <>
                      <span className="conector-h cx absolute left-[6rem] top-[2.4rem] hidden md:block" aria-hidden><svg viewBox="0 0 12 20" className="absolute -right-1 -top-[8px] h-5 w-3 text-naranja"><path d="M1 1l10 9-10 9" fill="none" stroke="currentColor" strokeWidth="3" /></svg></span>
                      <span className="conector-v cx absolute left-[2.35rem] top-[5.75rem] bottom-[-2.5rem] md:hidden" aria-hidden />
                    </>
                  )}
                  <div className="md:mt-7">
                    <p className="text-xs font-bold uppercase tracking-widest text-naranja">Paso 0{i + 1}</p>
                    <h3 className="mt-1 text-2xl font-extrabold text-tinta">{p.t}</h3>
                    <p className="mt-2 leading-relaxed text-grafito/75">{p.d}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Cta />
    </>
  );
}
