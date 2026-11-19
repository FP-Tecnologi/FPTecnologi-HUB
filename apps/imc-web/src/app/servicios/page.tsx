import type { Metadata } from "next";
import Enlace from "@/components/Enlace";
import Reveal from "@/components/Reveal";
import { Cta, Hex, Icono, Portada, Seccion, Titulo } from "@/components/ui";
import { PASOS, PROYECTOS, SERVICIOS } from "@/lib/datos";

export const metadata: Metadata = { title: "Servicios", description: "Cómputo, impresión, networking, servidores, software, cableado estructurado e implementación de centrales telefónicas." };

export default function Servicios() {
  return (
    <>
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
            <article className="degradado-azul flex h-full flex-col justify-between p-8 text-white">
              <h3 className="text-2xl font-extrabold leading-tight">¿No ves lo que buscas? Lo conseguimos.</h3>
              <Enlace href="/contacto/" className="btn btn-naranja mt-6 self-start">Escríbenos <Icono n="flecha" className="h-5 w-5" /></Enlace>
            </article>
          </Reveal>
        </div>
      </Seccion>

      <Seccion className="bg-white">
        <Reveal><Titulo a="Cómo" b="trabajamos" /></Reveal>
        <ol className="relative mt-14 grid gap-8 md:grid-cols-4">
          <div className="absolute left-0 right-0 top-9 hidden h-0.5 bg-gradient-to-r from-azul-2 to-naranja md:block" aria-hidden />
          {PASOS.map((p, i) => (
            <Reveal key={p.t} delay={i * 130}>
              <li className="grupo relative">
                <span className="insignia hex relative h-[4.5rem] w-[4.5rem] text-2xl font-extrabold">{i + 1}</span>
                <h3 className="mt-5 text-xl font-extrabold text-azul-osc">{p.t}</h3>
                <p className="mt-2 text-grafito/75">{p.d}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </Seccion>

      <Cta />
    </>
  );
}
