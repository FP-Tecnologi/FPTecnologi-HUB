import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import { Cta, Hex, Icono, Portada, Seccion } from "@/components/ui";
import { PERU_COMPRAS } from "@/lib/datos";

export const metadata: Metadata = { title: "Perú Compras", description: "Company IMC tiene fichas publicadas en Perú Compras para facilitar tus adquisiciones estatales." };

export default function PeruCompras() {
  return (
    <>
      <Portada etiqueta="Compras estatales" a="Estamos en" b="Perú Compras" texto="Fichas publicadas y una logística que atiende de manera directa a los clientes de Perú Compras." />

      <Seccion className="bg-white">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div className="space-y-6">
            {PERU_COMPRAS.map((p, i) => (
              <Reveal key={p.t} delay={i * 120} dir="izq">
                <article className="tarjeta grupo flex items-center gap-6 p-7">
                  <Hex n={p.n} size="h-20 w-20" />
                  <div><h2 className="text-xl font-extrabold text-azul-osc">{p.t}</h2><p className="mt-1 text-grafito/80">{p.d}</p></div>
                </article>
              </Reveal>
            ))}
          </div>
          <Reveal dir="der">
            <div className="relative">
              <div className="absolute -inset-4 -rotate-3 bg-naranja/85" aria-hidden />
              <img src="/img/perucompras.webp" alt="Palacio de Gobierno, Lima" className="relative aspect-[4/3] w-full object-cover shadow-2xl" />
              <div className="absolute bottom-5 left-5 w-44 bg-white p-3 shadow-xl"><img src="/img/perucompras-logo.webp" alt="Perú Compras" className="h-auto w-full" /></div>
              <p className="relative mt-7 text-right text-[11px] text-grafito/50">Foto: Wasiwatana, CC BY-SA 4.0 (Wikimedia Commons)</p>
            </div>
          </Reveal>
        </div>
      </Seccion>

      <section className="relative overflow-hidden bg-azul-claro px-5 py-20 sm:py-28">
        <div className="cuadricula absolute inset-0" aria-hidden />
        <Reveal dir="zoom" className="relative mx-auto max-w-4xl text-center">
          <Icono n="estrella" className="mx-auto h-10 w-10 text-azul-2" />
          <p className="mt-6 text-3xl font-medium italic leading-snug sm:text-5xl">Soluciones tecnológicas para el <span className="font-extrabold text-azul-2">crecimiento empresarial</span>.</p>
        </Reveal>
      </section>

      <Cta />
    </>
  );
}
