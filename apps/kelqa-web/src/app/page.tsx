import { ArrowRight, BadgePercent, Headset, Mail, MessageCircle, Phone, Quote, ShieldCheck, Truck } from 'lucide-react';
import Reveal from '@/components/Reveal';
import Titulo from '@/components/Titulo';
import { contacto, lineas, razones, testimonios, valores, waUrl } from '@/lib/contenido';

const ICONOS_RAZON = [ShieldCheck, BadgePercent, Truck, Headset];
const contenedor = 'mx-auto max-w-7xl px-5 sm:px-8';
const botonPrimario = 'inline-flex h-13 items-center gap-2 rounded-xl bg-kelqa px-6 font-semibold text-white shadow-lg shadow-kelqa-hondo/35 transition hover:-translate-y-0.5 hover:bg-kelqa-hondo';

export default function Inicio() {
  return (
    <main>
      {/* HERO */}
      <section id="inicio" className="relative isolate overflow-hidden bg-tinta text-white">
        <img src="/fotos/cumbre.webp" alt="" className="hero-foto absolute inset-0 -z-20 size-full -scale-x-100 object-cover object-[35%_center]" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,var(--color-tinta)_10%,rgb(14_28_30/0.82)_45%,rgb(19_106_111/0.25)_100%)]" />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-tinta to-transparent" />
        {/* Marca de agua: el ícono del logo, como en la portada del brochure. */}
        <img src="/icon.svg" alt="" aria-hidden="true" className="pointer-events-none absolute -bottom-24 -left-24 -z-10 w-[26rem] opacity-[0.07] grayscale brightness-[3]" />

        <div className={`${contenedor} grid min-h-[100svh] grid-cols-1 items-center gap-12 pb-20 pt-32 lg:grid-cols-[1.15fr_0.85fr]`}>
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-kelqa-claro backdrop-blur">
              <span aria-hidden="true" className="size-2 rounded-[3px] bg-current" />Industria · Construcción · Corporativo
            </p>
            <h1 className="mt-6 text-[clamp(2.6rem,7vw,5rem)] font-extrabold leading-[1.02] tracking-tight text-white">
              Hecha para <span className="titulo-brillo titulo-brillo-claro">avanzar contigo</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/85">
              Soluciones confiables y de alto valor para tus proyectos: pinturas, mobiliario corporativo y productos para construcción y emergencia, con cobertura a nivel nacional.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href={waUrl('Hola Kelqa, quisiera cotizar productos para mi proyecto.')} target="_blank" rel="noopener noreferrer" className={botonPrimario}>
                <MessageCircle aria-hidden="true" size={20} />Cotizar ahora
              </a>
              <a href="#lineas" className="inline-flex h-13 items-center gap-2 rounded-xl border border-white/30 px-6 font-semibold text-white backdrop-blur transition hover:bg-white hover:text-tinta">
                Ver líneas <ArrowRight aria-hidden="true" size={18} />
              </a>
            </div>
            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/75">
              {['Venta directa', 'Licitaciones públicas y privadas', 'Fichas en Perú Compras'].map((t) => (
                <li key={t} className="flex items-center gap-2"><span aria-hidden="true" className="size-1.5 rounded-[2px] bg-kelqa-claro" />{t}</li>
              ))}
            </ul>
          </div>

          {/* Acceso rápido a las tres líneas. */}
          <nav aria-label="Líneas de producto" className="self-end rounded-[2rem] border border-white/15 bg-white/[0.07] p-3 backdrop-blur-md">
            <p className="px-3 pb-2 pt-2 text-xs font-bold uppercase tracking-[0.18em] text-white/70">Tres líneas, un mismo estándar</p>
            <ul className="grid gap-2">
              {lineas.map((l, i) => (
                <li key={l.id}>
                  <a href={`#${l.id}`} className="group flex items-center gap-4 rounded-2xl bg-white/[0.06] p-3 transition hover:bg-white hover:text-tinta">
                    <span className="grid size-20 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-white to-niebla">
                      <img src={l.productos[0].img} alt="" className="h-16 w-16 object-contain transition-transform duration-500 group-hover:scale-110" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-kelqa-claro group-hover:text-kelqa-hondo">0{i + 1}</span>
                      <b className="block font-titulo text-lg leading-tight">{l.nombre}</b>
                      <span className="block truncate text-sm text-white/70 group-hover:text-carbon">{l.productos.map((p) => p.nombre.replace('Línea ', '')).join(' · ')}</span>
                    </span>
                    <ArrowRight aria-hidden="true" size={20} className="mr-2 shrink-0 transition-transform group-hover:translate-x-1" />
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      {/* NOSOTROS */}
      <section id="nosotros" className="py-24 sm:py-28">
        <div className={`${contenedor} grid items-center gap-14 lg:grid-cols-2`}>
          <Reveal className="relative">
            <img src="/fotos/equipo.webp" alt="Equipo de obra revisando planos de un proyecto" className="aspect-[4/3.4] w-full rounded-[2rem] rounded-tr-[6rem] object-cover shadow-2xl shadow-kelqa-hondo/25" />
            <div className="absolute -bottom-8 left-6 right-6 rounded-2xl bg-tinta p-5 text-white shadow-xl shadow-tinta/30 sm:left-auto sm:w-72">
              <p className="font-titulo text-lg font-bold leading-snug">Aliado estratégico en cada etapa de tu proyecto</p>
              <span aria-hidden="true" className="mt-3 block h-1 w-12 rounded-full bg-kelqa" />
            </div>
          </Reveal>
          <Reveal retraso={120} className="pt-6 lg:pt-0">
            <Titulo etiqueta="Quiénes somos" solido="Más que productos," acento="soluciones que generan impacto" />
            <p className="mt-6 text-lg leading-relaxed">
              Desarrollamos y ofrecemos soluciones confiables, eficientes y de alto valor para los sectores industrial y construcción, con productos que integran calidad, rendimiento, durabilidad y precios competitivos.
            </p>
            <p className="mt-4 leading-relaxed text-carbon/85">
              Creemos en el trabajo bien hecho y en relaciones comerciales basadas en la confianza, la responsabilidad, la transparencia y un servicio oportuno.
            </p>
            <ul className="mt-7 flex flex-wrap gap-2">
              {valores.map((v) => (
                <li key={v} className="inline-flex items-center gap-2 rounded-xl border border-kelqa/20 bg-kelqa/5 px-4 py-2 text-sm font-semibold text-kelqa-hondo">
                  <span aria-hidden="true" className="size-2 rounded-[3px] bg-kelqa" />{v}
                </li>
              ))}
            </ul>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-niebla p-5">
                <h3 className="text-base font-bold">Misión</h3>
                <p className="mt-2 text-sm leading-relaxed text-carbon/85">Brindar soluciones confiables y de alta calidad que impulsen proyectos en diversos sectores, con cobertura nacional y un servicio cercano.</p>
              </div>
              <div className="rounded-2xl bg-niebla p-5">
                <h3 className="text-base font-bold">Visión</h3>
                <p className="mt-2 text-sm leading-relaxed text-carbon/85">Ser una marca reconocida por su excelencia, cercanía y compromiso, aliada de nuestros clientes en cada etapa de sus proyectos.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* LÍNEAS */}
      <section id="lineas" className="bg-niebla py-24 sm:py-28">
        <div className={contenedor}>
          <Reveal>
            <Titulo centro etiqueta="Nuestras líneas" solido="Soluciones para" acento="cada proyecto" />
          </Reveal>
          <div className="mt-14 grid gap-10">
            {lineas.map((l, i) => (
              <Reveal key={l.id}>
                <article id={l.id} className={`grid overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-kelqa-hondo/10 ${i % 2 ? 'lg:grid-cols-[1.25fr_0.75fr]' : 'lg:grid-cols-[0.75fr_1.25fr]'}`}>
                  <div className={`relative isolate flex min-h-80 flex-col justify-end p-8 text-white ${i % 2 ? 'lg:order-2' : ''}`}>
                    <img src={l.foto} alt="" className="absolute inset-0 -z-20 size-full object-cover" />
                    <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-tinta via-tinta/55 to-tinta/0" />
                    <span className="font-titulo text-6xl font-extrabold text-white/25">0{i + 1}</span>
                    <h3 className="mt-1 text-3xl font-extrabold text-white">{l.nombre}</h3>
                    <p className="mt-2 max-w-sm text-white/85">{l.lema}</p>
                  </div>
                  <div className="p-6 sm:p-10">
                    <p className="leading-relaxed text-carbon/90">{l.texto}</p>
                    <ul className="mt-7 grid gap-4 sm:grid-cols-2">
                      {l.productos.map((p) => (
                        <li key={p.nombre} className="group flex items-center gap-4 rounded-2xl bg-niebla p-3 transition hover:-translate-y-1 hover:bg-white hover:shadow-lg hover:shadow-kelqa-hondo/15 sm:[&:last-child:nth-child(odd)]:col-span-2">
                          <span className="grid size-24 shrink-0 place-items-center rounded-xl bg-white">
                            <img src={p.img} alt={p.nombre} loading="lazy" className="max-h-20 max-w-20 object-contain drop-shadow-lg transition-transform duration-500 group-hover:scale-110" />
                          </span>
                          <span>
                            <h4 className="font-titulo font-bold leading-tight text-tinta">{p.nombre}</h4>
                            <p className="mt-1 text-sm leading-snug text-carbon/80">{p.detalle}</p>
                          </span>
                        </li>
                      ))}
                    </ul>
                    <a href={waUrl(`Hola Kelqa, quisiera cotizar productos de la ${l.nombre}.`)} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex items-center gap-2 font-semibold text-kelqa-hondo hover:underline">
                      Cotizar esta línea <ArrowRight aria-hidden="true" size={18} />
                    </a>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* POR QUÉ */}
      <section className="py-24 sm:py-28">
        <div className={`${contenedor} grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]`}>
          <Reveal>
            <Titulo etiqueta="¿Por qué Kelqa?" solido="Construimos" acento="relaciones que duran" />
            <p className="mt-6 text-lg leading-relaxed">
              Buen servicio es acompañarte de cerca, entender los desafíos de tu proyecto y proponer alternativas eficientes, oportunas y alineadas a tus objetivos.
            </p>
            <img src="/fotos/vial-obra.webp" alt="Cuadrilla pintando señalización vial con pintura Kelqa" loading="lazy" className="mt-8 hidden aspect-[16/9] w-full rounded-[2rem] rounded-bl-[5rem] object-cover shadow-xl shadow-kelqa-hondo/20 lg:block" />
          </Reveal>
          <ul className="grid gap-5 sm:grid-cols-2">
            {razones.map((r, i) => {
              const Icono = ICONOS_RAZON[i];
              return (
                <li key={r.titulo}>
                  <Reveal retraso={i * 90} className="h-full rounded-[1.75rem] border border-kelqa/10 bg-white p-7 shadow-lg shadow-kelqa-hondo/10 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-kelqa-hondo/20">
                    <span className="grid size-14 place-items-center rounded-2xl bg-kelqa text-white shadow-lg shadow-kelqa-hondo/30"><Icono aria-hidden="true" size={26} /></span>
                    <h3 className="mt-5 text-xl font-bold">{r.titulo}</h3>
                    <p className="mt-2 leading-relaxed text-carbon/85">{r.texto}</p>
                  </Reveal>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* CANALES DE VENTA */}
      <section className="px-5 sm:px-8">
        <Reveal className="relative isolate mx-auto grid max-w-7xl items-center overflow-hidden rounded-[2.5rem] rounded-tr-[7rem] bg-tinta text-white lg:grid-cols-2">
          <img src="/icon.svg" alt="" aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 -z-10 w-80 opacity-10" />
          <div className="p-8 sm:p-14">
            <Titulo oscuro etiqueta="Sector público y privado" solido="Venta directa y" acento="licitaciones" />
            <p className="mt-6 text-lg leading-relaxed text-white/80">
              Atendemos ventas directas y licitaciones públicas y privadas. Encuentra todas nuestras fichas en <b className="text-white">Perú Compras</b>.
            </p>
            <a href={waUrl('Hola Kelqa, represento a una entidad y quisiera información sobre licitaciones o Perú Compras.')} target="_blank" rel="noopener noreferrer" className={`${botonPrimario} mt-8`}>
              <MessageCircle aria-hidden="true" size={20} />Consultar disponibilidad
            </a>
          </div>
          <img src="/fotos/obra.webp" alt="Obra en construcción abastecida con productos Kelqa" loading="lazy" className="h-full min-h-72 w-full object-cover" />
        </Reveal>
      </section>

      {/* TESTIMONIOS */}
      <section id="clientes" className="py-24 sm:py-28">
        <div className={contenedor}>
          <Reveal><Titulo centro etiqueta="Clientes" solido="Nuestra experiencia" acento="habla por nosotros" /></Reveal>
          <ul className="mt-14 grid gap-6 md:grid-cols-3">
            {testimonios.map((t, i) => (
              <li key={t.empresa}>
                <Reveal retraso={i * 100} className="flex h-full flex-col rounded-[1.75rem] bg-niebla p-8">
                  <Quote aria-hidden="true" size={34} className="text-kelqa" />
                  <blockquote className="mt-4 flex-1 leading-relaxed text-carbon/90">«{t.texto}»</blockquote>
                  <p className="mt-6 border-t border-kelqa/15 pt-4 text-sm"><b className="block font-titulo text-tinta">{t.empresa}</b>{t.autor}</p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CONTACTO */}
      <section id="contacto" className="px-5 pb-24 sm:px-8">
        <Reveal className="relative isolate mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-kelqa to-kelqa-hondo px-8 py-14 text-center text-white sm:px-14">
          <img src="/fotos/obrero.webp" alt="" aria-hidden="true" className="pointer-events-none absolute bottom-0 right-8 -z-10 hidden h-[92%] lg:block" />
          <img src="/fotos/trafico.webp" alt="" aria-hidden="true" className="flotar pointer-events-none absolute -left-6 bottom-6 -z-10 hidden w-44 -rotate-12 lg:block" />
          <h2 className="text-[clamp(2rem,5vw,3.25rem)] font-extrabold text-white">¡Estamos listos!</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/90">Cuéntanos tu proyecto y te proponemos la solución precisa. Escríbenos y te atendemos de inmediato.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href={waUrl('Hola Kelqa, quisiera más información.')} target="_blank" rel="noopener noreferrer" className="inline-flex h-13 items-center gap-2 rounded-xl bg-white px-6 font-semibold text-kelqa-hondo shadow-lg shadow-tinta/25 transition hover:-translate-y-0.5">
              <MessageCircle aria-hidden="true" size={20} />WhatsApp
            </a>
            <a href={contacto.telefonoHref} className="inline-flex h-13 items-center gap-2 rounded-xl border border-white/40 px-6 font-semibold transition hover:bg-white/10">
              <Phone aria-hidden="true" size={18} />{contacto.telefono}
            </a>
            <a href={`mailto:${contacto.correo}`} className="inline-flex h-13 items-center gap-2 rounded-xl border border-white/40 px-6 font-semibold transition hover:bg-white/10">
              <Mail aria-hidden="true" size={18} />{contacto.correo}
            </a>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
