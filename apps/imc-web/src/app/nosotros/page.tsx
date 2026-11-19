import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { meta, migas } from "@/lib/seo";
import Reveal from "@/components/Reveal";
import { Chevrones, Cta, Hex, Icono, Portada, Seccion, Titulo } from "@/components/ui";
import { VALORES } from "@/lib/datos";
import { getPagina } from "@/lib/cms";

export const metadata: Metadata = meta("Nosotros", "Conoce a Company IMC: misión, visión y valores de tu socio estratégico en soluciones tecnológicas.", "/nosotros/");

export default async function Nosotros() {
  const [{ banner, historia: h, mision, vision, valores, kelqa }, { porque }] = await Promise.all([getPagina("nosotros"), getPagina("inicio")]);
  const MOTIVOS = porque.items.map((i) => i.texto);
  return (
    <>
      <JsonLd datos={migas("Nosotros", "/nosotros/")} />
      <Portada etiqueta={banner.etiqueta} a={banner.titulo} b={banner.acento} texto={banner.texto} />

      <Seccion className="bg-white">
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_.8fr]">
          <div>
            <Reveal><p className="text-3xl font-semibold italic leading-snug text-tinta sm:text-4xl">“{h.citaInicio} <span className="text-azul-2">{h.citaAcento}</span>{h.citaFin}”</p></Reveal>
            <Reveal delay={120}><p className="mt-8 text-lg leading-relaxed text-grafito/85">{h.parrafo1}</p></Reveal>
            <Reveal delay={200}><p className="mt-5 text-lg leading-relaxed text-grafito/85">{h.parrafo2}</p></Reveal>
          </div>
          <Reveal dir="der">
            <div className="relative mx-auto max-w-sm">
              <div className="hex absolute inset-0 scale-110 bg-naranja-claro" />
              <img src="/img/hombre.webp" alt="Profesional de Company IMC" className="relative mx-auto h-[28rem] w-auto object-contain drop-shadow-xl" />
            </div>
          </Reveal>
        </div>
      </Seccion>

      {/* Misión y visión */}
      <section className="relative overflow-hidden bg-azul-claro px-5 py-20 sm:py-28">
        <div className="cuadricula absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-6xl">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <Reveal><Titulo a="Misión" b="y visión" /></Reveal>
            <Chevrones />
          </div>
          <div className="mt-14 grid gap-8 md:grid-cols-2 md:items-stretch">
            {[
              ["meta", "Misión", mision.lema, mision.texto, false],
              ["estrella", "Visión", vision.lema, vision.texto, true],
            ].map(([n, t, lema, p, azul], i) => (
              <Reveal key={t as string} delay={i * 140} dir={i ? "der" : "izq"} className="h-full">
                <article className={`tarjeta group relative h-full overflow-hidden p-8 sm:p-10 ${azul ? "degradado-azul puntos-claro text-white" : ""}`}>
                  <div className={`absolute inset-x-0 top-0 h-1.5 ${azul ? "bg-naranja" : "bg-gradient-to-r from-azul-2 to-naranja"}`} aria-hidden />
                  <div className="relative">
                    <Hex n={n as string} size="h-20 w-20" />
                    <p className={`mt-7 text-xs font-bold uppercase tracking-[.2em] ${azul ? "text-naranja" : "text-azul-2"}`}>{lema}</p>
                    <h3 className={`titulo mt-2 text-5xl ${azul ? "claro" : ""}`}><b>{t}</b></h3>
                    <div className="regla mt-5 transition-[width] duration-700 ease-[var(--ease-salida)] group-hover:!w-40" />
                    <p className={`mt-6 text-lg leading-relaxed ${azul ? "text-white/85" : "text-grafito/85"}`}>{p}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Valores */}
      <Seccion className="bg-white">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal><Titulo a="Nuestros" b="valores" /></Reveal>
          <Chevrones />
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {valores.items.map((v, i) => (
            <Reveal key={`${v.t}-${i}`} delay={i * 120}>
              <article className="tarjeta h-full p-8">
                <Hex n={VALORES[i % VALORES.length].n} size="h-24 w-24" icon="h-9 w-9" />
                <h3 className="mt-6 text-xl font-extrabold text-azul-osc">{v.t}</h3>
                <p className="mt-3 leading-relaxed text-grafito/80">{v.d}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </Seccion>

      {/* Por qué */}
      <Seccion className="bg-azul-claro">
        <Reveal><Titulo a="¿Por qué" b="escogernos?" /></Reveal>
        <ul className="mt-12 grid gap-5 md:grid-cols-2">
          {MOTIVOS.map((m, i) => (
            <Reveal key={`${m}-${i}`} delay={i * 90}>
              <li className="tarjeta grupo flex h-full gap-5 p-7"><span className="insignia h-10 w-10 shrink-0"><Icono n="check" className="h-5 w-5" /></span><p className="leading-relaxed">{m}</p></li>
            </Reveal>
          ))}
        </ul>
        <Reveal delay={150}>
          <div className="tarjeta mt-12 flex flex-wrap items-center justify-between gap-5 p-8">
            <div><h3 className="text-2xl font-extrabold text-azul-osc">{kelqa.titulo}</h3><p className="mt-1 text-grafito/75">{kelqa.texto}</p></div>
            <a href="https://kelqa.com" className="btn btn-azul">Visitar Kelqa <Icono n="flecha" className="h-5 w-5" /></a>
          </div>
        </Reveal>
      </Seccion>

      <Cta />
    </>
  );
}
