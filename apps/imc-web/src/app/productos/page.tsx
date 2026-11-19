import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { meta, migas } from "@/lib/seo";
import Enlace from "@/components/Enlace";
import Reveal from "@/components/Reveal";
import { Cta, Hex, Icono, Portada, Seccion, Titulo } from "@/components/ui";
import { MARCAS, PRODUCTOS } from "@/lib/datos";

export const metadata: Metadata = meta("Productos", "Computadoras, monitores, impresoras, proyectores, servidores y equipos de red de las marcas más reconocidas.", "/productos/");

export default function Productos() {
  return (
    <>
      <JsonLd datos={migas("Productos", "/productos/")} />
      <Portada etiqueta="Catálogo" a="Nuestros" b="productos" texto="Trabajamos con las marcas más reconocidas del mercado para garantizar la calidad y confiabilidad de cada equipo." />

      <Seccion className="bg-white">
        <div className="grid gap-6 sm:grid-cols-2">
          {PRODUCTOS.map((p, i) => (
            <Reveal key={p.t} delay={(i % 2) * 120}>
              <article className="tarjeta group relative flex h-full items-center gap-6 overflow-hidden p-8">
                <div className="hex absolute -right-10 -top-10 h-44 w-44 bg-azul-claro transition-transform duration-700 group-hover:rotate-45 group-hover:scale-125" aria-hidden />
                <div className="relative flex h-44 w-1/2 items-center justify-center"><img src={p.img} alt={p.t} className="max-h-full w-auto max-w-full object-contain transition-transform duration-700 ease-[var(--ease-salida)] group-hover:scale-110 group-hover:-rotate-3" /></div>
                <div className="relative w-1/2">
                  <h2 className="text-2xl font-extrabold uppercase leading-tight text-tinta">{p.t}</h2>
                  <Enlace href="/contacto/" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-azul-2">Cotizar <Icono n="flecha" className="h-4 w-4 transition group-hover:translate-x-1" /></Enlace>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {[["servidor", "Servidores", "Infraestructura para respaldar y escalar tus sistemas."], ["red", "Networking", "Equipos de red para mantener tu organización conectada."]].map(([n, t, d], i) => (
            <Reveal key={t} delay={i * 120}>
              <article className="tarjeta grupo flex h-full items-center gap-6 p-8"><Hex n={n} size="h-20 w-20" /><div><h3 className="text-xl font-extrabold uppercase text-azul-osc">{t}</h3><p className="mt-1 text-grafito/75">{d}</p></div></article>
            </Reveal>
          ))}
        </div>
      </Seccion>

      {/* Marcas + presentación */}
      <section className="relative overflow-hidden bg-azul-claro px-5 py-20 sm:py-28">
        <div className="cuadricula absolute inset-0" aria-hidden />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[.9fr_1.1fr]">
          <Reveal dir="izq">
            <div className="relative mx-auto max-w-md">
              <div className="hex absolute inset-0 scale-110 bg-naranja-claro" />
              <div className="hex absolute inset-[6%] scale-110 bg-white/70" />
              <img src="/img/laptop.webp" alt="Laptop con marcas aliadas" className="relative mx-auto max-h-[28rem] w-auto object-contain drop-shadow-2xl" />
            </div>
          </Reveal>
          <div>
            <Reveal><Titulo a="Marcas" b="líderes" /></Reveal>
            <Reveal delay={100}><p className="mt-6 max-w-lg text-lg text-grafito/85">Alianzas con fabricantes reconocidos que nos permiten ofrecer productos originales, garantía y valor agregado.</p></Reveal>
            <div className="mt-8 grid grid-cols-3 gap-4 sm:grid-cols-5">
              {MARCAS.map((m, i) => (
                <Reveal key={m.f} delay={i * 50}><div className="tarjeta flex h-20 items-center justify-center p-3"><img src={`/marcas/${m.f}.svg`} alt={m.n} className="max-h-9 w-auto max-w-full opacity-70 brightness-0 transition hover:opacity-100" /></div></Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Cta />
    </>
  );
}
