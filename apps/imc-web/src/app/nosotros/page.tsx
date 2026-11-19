import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import { Chevrones, Cta, Hex, Icono, Portada, Seccion, Titulo } from "@/components/ui";
import { MOTIVOS, VALORES } from "@/lib/datos";

export const metadata: Metadata = { title: "Nosotros", description: "Conoce a Company IMC: misión, visión y valores de tu socio estratégico en soluciones tecnológicas." };

export default function Nosotros() {
  return (
    <>
      <Portada etiqueta="Sobre nosotros" a="Tecnología que" b="transforma negocios" texto="Más de 4 años siendo el socio estratégico de empresas e instituciones que buscan eficiencia y crecimiento." />

      <Seccion className="bg-white">
        <div className="grid items-center gap-14 lg:grid-cols-[1fr_.8fr]">
          <div>
            <Reveal><p className="text-3xl font-semibold italic leading-snug text-tinta sm:text-4xl">“Nos mantenemos a la vanguardia de la tecnología para ofrecer soluciones de <span className="text-azul-2">última generación</span>.”</p></Reveal>
            <Reveal delay={120}><p className="mt-8 text-lg leading-relaxed text-grafito/85">En Company IMC creemos en el poder de la tecnología para transformar negocios y mejorar vidas. Con más de 4 años de experiencia, nos hemos consolidado como un buen socio estratégico para empresas de diversos sectores, brindando soluciones integrales que impulsan el valor del crecimiento y la eficiencia.</p></Reveal>
            <Reveal delay={200}><p className="mt-5 text-lg leading-relaxed text-grafito/85">Somos especialistas en soluciones tecnológicas para el sector público: equipos de cómputo, servidores, monitores y todo el ecosistema TI que impulsa la transformación digital de las instituciones del Estado.</p></Reveal>
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
      <section className="oscuro relative overflow-hidden bg-grafito px-5 py-20 text-white sm:py-28">
        <div className="cuadricula-claro absolute inset-0" aria-hidden />
        <div className="relative mx-auto grid max-w-6xl gap-8 md:grid-cols-2">
          {[
            ["meta", "Misión", "Ser una organización en constante transformación, enfocada en la sostenibilidad de nuestro crecimiento y participación en el mercado, mejorando la calidad de las soluciones proporcionadas a nuestros clientes, dentro de un ecosistema empresarial sostenible."],
            ["estrella", "Visión", "Ser un referente en el mercado nacional de comercialización de equipos informáticos y ejecución de proyectos tecnológicos con un elevado valor añadido en innovación y calidad, desarrollando talentos y habilidades en un excelente ambiente laboral, motivados por buscar y satisfacer continuamente las necesidades de nuestros clientes, contribuyendo con responsabilidad social y cuidado del medio ambiente."],
          ].map(([n, t, p], i) => (
            <Reveal key={t} delay={i * 140} dir={i ? "der" : "izq"}>
              <article className="grupo h-full rounded-[2rem] border border-white/15 bg-white/5 p-9 backdrop-blur transition hover:border-naranja/60 hover:bg-white/10">
                <Hex n={n} size="h-20 w-20" />
                <h2 className="titulo claro mt-6 text-4xl"><b>{t}</b></h2>
                <p className="mt-4 leading-relaxed text-white/80">{p}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Valores */}
      <Seccion className="bg-white">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal><Titulo a="Nuestros" b="valores" /></Reveal>
          <Chevrones />
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {VALORES.map((v, i) => (
            <Reveal key={v.t} delay={i * 120}>
              <article className="tarjeta h-full p-8">
                <Hex n={v.n} size="h-24 w-24" icon="h-9 w-9" />
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
            <Reveal key={m} delay={i * 90}>
              <li className="tarjeta grupo flex h-full gap-5 p-7"><span className="insignia h-10 w-10 shrink-0 rounded-xl"><Icono n="check" className="h-5 w-5" /></span><p className="leading-relaxed">{m}</p></li>
            </Reveal>
          ))}
        </ul>
        <Reveal delay={150}>
          <div className="mt-12 flex flex-wrap items-center justify-between gap-5 rounded-[2rem] bg-white p-8 shadow-[0_18px_40px_-22px_rgba(23,46,94,.45)]">
            <div><h3 className="text-2xl font-extrabold text-azul-osc">Kelqa, nuestra nueva marca</h3><p className="mt-1 text-grafito/75">Nace de nuestra experiencia para elevar los estándares del mercado peruano con productos de valor real y duradero.</p></div>
            <a href="https://kelqa.com" className="btn btn-azul">Visitar Kelqa <Icono n="flecha" className="h-5 w-5" /></a>
          </div>
        </Reveal>
      </Seccion>

      <Cta />
    </>
  );
}
