import type { ReactNode } from "react";

const TEL = "+51 984 268 0547";
const TEL_HREF = "https://wa.me/519842680547";
const MAIL = "ventas@companyimc.com";

const nav = [
  ["Nosotros", "#nosotros"],
  ["Servicios", "#servicios"],
  ["Productos", "#productos"],
  ["Perú Compras", "#peru-compras"],
  ["Contacto", "#contacto"],
];

const servicios = [
  ["Cómputo", "M4 5h11v9H4zM7 17h5M9.5 14v3M17 8h3v10h-3z"],
  ["Impresión", "M7 9V4h10v5M7 17H4v-7h16v7h-3M7 14h10v6H7z"],
  ["Networking", "M12 3v5M5 21v-5h14v5M12 8v8M5 16v-3h14v3M8 3h8v5H8z"],
  ["Servidores", "M4 5h16v5H4zM4 12h16v5H4zM7 7.5h.01M7 14.5h.01M4 19h16"],
  ["Software", "M12 3l8 4v6c0 4-3.5 7-8 8-4.5-1-8-4-8-8V7zM9 12l2 2 4-4"],
  ["Cableado estructurado", "M3 8h6v8H3zM15 8h6v8h-6zM9 12h6M5 5v3M7 5v3M17 16v3M19 16v3"],
  ["Centrales telefónicas", "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z"],
];

const productos = ["Computadoras", "Monitores", "Impresoras", "Proyectores", "Servidores", "Equipos de red"];
const marcas = ["HP", "Dell", "Lenovo", "Microsoft", "Epson", "HPE", "Intel", "Cisco", "Fortinet", "Axis"];

const valores = [
  ["Equipo experto", "Contamos con un equipo de profesionales altamente capacitados y con amplia experiencia en el sector.", "M12 3a6 6 0 0 0-3 11v3h6v-3a6 6 0 0 0-3-11zM9.5 20h5"],
  ["A tu medida", "Adaptamos nuestras soluciones a las necesidades específicas de cada cliente.", "M4 12l5 5L20 6"],
  ["Soporte integral", "Brindamos un servicio de soporte técnico integral para garantizar el óptimo funcionamiento de nuestras soluciones.", "M4 20V10M10 20V4M16 20v-8M22 20H2"],
];

const motivos = [
  "Analizamos tus requerimientos y te ofrecemos soluciones a medida que se adaptan a tu presupuesto y objetivos.",
  "Desde equipos de cómputo hasta sistemas de videovigilancia, contamos con un portafolio completo para cubrir todas tus necesidades tecnológicas.",
  "Trabajamos con las marcas más reconocidas del mercado para garantizar la calidad y confiabilidad de nuestras soluciones.",
  "Te acompañamos en cada etapa del proceso, desde la implementación hasta el soporte técnico continuo.",
];

function Icono({ d, className = "h-8 w-8" }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d={d} />
    </svg>
  );
}

function Chevrones({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 40" className={`chev-svg h-8 ${className}`} aria-hidden>
      {Array.from({ length: 10 }).map((_, i) => (
        <path key={i} d={`M${34 + i * 18} 2 L${12 + i * 18} 20 L${34 + i * 18} 38 L${42 + i * 18} 38 L${20 + i * 18} 20 L${42 + i * 18} 2 Z`} fill="currentColor" opacity={1 - i * 0.07} />
      ))}
    </svg>
  );
}

function Titulo({ a, b, claro = false }: { a: string; b?: string; claro?: boolean }) {
  return (
    <div>
      <h2 className={`titulo text-4xl sm:text-5xl ${claro ? "text-white" : ""}`}>
        {a} {b && <b className={claro ? "!text-naranja" : ""}>{b}</b>}
      </h2>
      <div className={`regla mt-5 ${claro ? "!bg-naranja" : ""}`} />
    </div>
  );
}

function Seccion({ id, className = "", children }: { id?: string; className?: string; children: ReactNode }) {
  return (
    <section id={id} className={`scroll-mt-20 px-5 py-20 sm:py-28 ${className}`}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-gris/60 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-2.5">
          <a href="#inicio" aria-label="Company IMC, inicio"><img src="/logo.svg" alt="Company IMC E.I.R.L." className="h-11 w-auto" /></a>
          <nav className="hidden items-center gap-7 text-sm font-medium md:flex" aria-label="Principal">
            {nav.map(([t, h]) => <a key={h} href={h} className="hover:text-azul-2">{t}</a>)}
          </nav>
          <a href="#contacto" className="rounded-full bg-azul-2 px-5 py-2 text-sm font-semibold text-white hover:bg-azul-osc">Cotizar</a>
        </div>
      </header>

      <main>
        <section id="inicio" className="relative overflow-hidden bg-white px-5 pb-20 pt-16 sm:pt-24">
          <div className="absolute -right-24 -top-24 h-80 w-80 bg-azul-2 [clip-path:polygon(0_0,100%_0,100%_100%)]" aria-hidden />
          <div className="absolute -bottom-20 -left-24 h-72 w-96 bg-azul-2 [clip-path:polygon(0_0,100%_100%,0_100%)]" aria-hidden />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
            <div>
              <p className="mb-4 inline-block rounded-full bg-naranja-claro px-4 py-1 text-sm font-semibold text-azul-osc">Proveedor en Perú Compras · +4 años de experiencia</p>
              <h1 className="titulo text-5xl sm:text-6xl">
                Soluciones tecnológicas para el <b>crecimiento empresarial</b>
              </h1>
              <p className="mt-6 max-w-xl text-lg text-grafito/80">
                No nos limitamos a vender productos: nos convertimos en tu socio estratégico. Equipos, redes, servidores y soporte, de principio a fin.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#contacto" className="rounded-full bg-naranja px-7 py-3 font-bold text-grafito shadow-lg shadow-naranja/30 hover:brightness-95">Solicitar cotización</a>
                <a href="#servicios" className="rounded-full border-2 border-azul-2 px-7 py-3 font-bold text-azul-2 hover:bg-azul-2 hover:text-white">Ver servicios</a>
              </div>
              <Chevrones className="mt-10" />
            </div>
            <div className="relative mx-auto aspect-square w-full max-w-md">
              <div className="hex absolute inset-0 bg-azul-2" />
              <div className="hex absolute inset-[7%] bg-white" />
              <div className="absolute inset-0 bg-naranja" style={{ clipPath: "polygon(7% 75%, 50% 100%, 93% 75%, 93% 66%, 50% 88%, 7% 66%)" }} />
              <img src="/logo.svg" alt="" className="absolute inset-[24%] m-auto h-1/2 w-1/2 object-contain" />
            </div>
          </div>
        </section>

        <Seccion id="nosotros" className="bg-white">
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <Titulo a="Sobre" b="Nosotros" />
              <p className="mt-8 text-3xl font-semibold italic leading-snug">“Nos mantenemos a la vanguardia de la tecnología para ofrecer soluciones de última generación.”</p>
            </div>
            <div className="space-y-5 text-lg leading-relaxed text-grafito/85">
              <p>En Company IMC creemos en el poder de la tecnología para transformar negocios y mejorar vidas. Con más de 4 años de experiencia, nos hemos consolidado como un buen socio estratégico para empresas de diversos sectores, brindando soluciones integrales que impulsan el valor del crecimiento y la eficiencia.</p>
              <p>Somos especialistas en soluciones tecnológicas para el sector público: equipos de cómputo, servidores, monitores y todo el ecosistema TI que impulsa la transformación digital de las instituciones del Estado.</p>
            </div>
          </div>
        </Seccion>

        <section className="bg-grafito px-5 py-20 text-white sm:py-28">
          <div className="mx-auto grid max-w-6xl gap-14 md:grid-cols-2">
            <div>
              <Titulo a="Misión" claro />
              <p className="mt-8 text-lg leading-relaxed text-white/85">Ser una organización en constante transformación, enfocada en la sostenibilidad de nuestro crecimiento y participación en el mercado, mejorando la calidad de las soluciones proporcionadas a nuestros clientes, dentro de un ecosistema empresarial sostenible.</p>
            </div>
            <div>
              <Titulo a="Visión" claro />
              <p className="mt-8 text-lg leading-relaxed text-white/85">Ser un referente en el mercado nacional de comercialización de equipos informáticos y ejecución de proyectos tecnológicos con un elevado valor añadido en innovación y calidad, desarrollando talentos y habilidades en un excelente ambiente laboral, con responsabilidad social y cuidado del medio ambiente.</p>
            </div>
          </div>
        </section>

        <Seccion className="bg-white">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <Titulo a="Nuestros" b="Valores" />
            <Chevrones />
          </div>
          <div className="mt-14 grid gap-12 md:grid-cols-3">
            {valores.map(([t, p, d]) => (
              <div key={t}>
                <div className="hex flex h-24 w-24 items-center justify-center bg-azul-2 text-white"><Icono d={d} className="h-9 w-9" /></div>
                <h3 className="mt-5 text-xl font-bold text-azul-osc">{t}</h3>
                <p className="mt-2 leading-relaxed text-grafito/80">{p}</p>
              </div>
            ))}
          </div>
        </Seccion>

        <Seccion id="servicios" className="bg-[#f4f6fa]">
          <Titulo a="Nuestros" b="Servicios" />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {servicios.map(([t, d]) => (
              <article key={t} className="group rounded-3xl bg-white p-7 shadow-[0_10px_30px_-12px_rgba(31,63,122,.35)] transition hover:-translate-y-1">
                <div className="hex flex h-16 w-16 items-center justify-center bg-azul-2 text-white group-hover:bg-naranja group-hover:text-grafito"><Icono d={d} className="h-7 w-7" /></div>
                <h3 className="mt-5 text-lg font-bold uppercase leading-tight text-azul-osc">{t}</h3>
              </article>
            ))}
          </div>
        </Seccion>

        <Seccion id="productos" className="bg-white">
          <Titulo a="Nuestros" b="Productos" />
          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3">
            {productos.map((p) => (
              <div key={p} className="rounded-3xl border-2 border-gris/70 px-6 py-10 text-center text-xl font-extrabold uppercase tracking-tight text-grafito transition hover:border-naranja">{p}</div>
            ))}
          </div>
          <p className="mt-10 text-sm font-semibold uppercase tracking-widest text-grafito/60">Marcas con las que trabajamos</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {marcas.map((m) => <span key={m} className="rounded-full bg-azul-2/10 px-5 py-2 font-bold text-azul-osc">{m}</span>)}
          </div>
        </Seccion>

        <Seccion id="peru-compras" className="bg-grafito text-white">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <h2 className="titulo text-4xl sm:text-5xl">Estamos en <span className="text-[#ee2a35]">Perú Compras</span></h2>
              <div className="regla mt-5 !bg-naranja" />
              <ul className="mt-10 space-y-6">
                {[
                  ["Fichas publicadas", "Facilitando tus adquisiciones estatales."],
                  ["Facilidad de compra", "Contamos con diversas fichas publicadas para tu comodidad."],
                  ["Seguridad y confianza", "Nuestra logística atiende de manera directa a los clientes de Perú Compras."],
                ].map(([t, p]) => (
                  <li key={t} className="flex gap-4">
                    <span className="hex mt-1 block h-10 w-10 shrink-0 bg-azul-2" />
                    <div><h3 className="text-xl font-semibold">{t}</h3><p className="text-white/75">{p}</p></div>
                  </li>
                ))}
              </ul>
            </div>
            <blockquote className="rounded-3xl bg-white/5 p-10 text-3xl font-medium italic leading-snug">
              <span className="text-6xl leading-none text-azul-2">”</span><br />Soluciones tecnológicas para el crecimiento empresarial.
            </blockquote>
          </div>
        </Seccion>

        <Seccion className="bg-white">
          <Titulo a="¿Por qué" b="escogernos?" />
          <p className="mt-8 max-w-3xl text-2xl font-medium italic leading-snug">Entendemos que cada empresa es única y enfrenta desafíos específicos. Por eso, no nos limitamos a vender productos, sino que nos convertimos en tu socio estratégico.</p>
          <ul className="mt-10 grid gap-5 md:grid-cols-2">
            {motivos.map((m) => (
              <li key={m} className="flex gap-4 rounded-2xl bg-[#f4f6fa] p-6">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-azul-2 text-white"><Icono d="M4 12l5 5L20 6" className="h-5 w-5" /></span>
                <p className="leading-relaxed">{m}</p>
              </li>
            ))}
          </ul>
        </Seccion>

        <Seccion id="contacto" className="bg-azul-2 text-white">
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <h2 className="titulo text-4xl sm:text-5xl">Hablemos de <span className="text-naranja">tu proyecto</span></h2>
              <p className="mt-6 text-lg text-white/85">Pide asesoría personalizada para tus proyectos de tecnología.</p>
              <dl className="mt-8 space-y-3 text-lg">
                <div><dt className="text-sm uppercase tracking-widest text-white/60">Oficina Lima, Perú</dt><dd>Lun – Vie · 8:30 am a 6:30 pm</dd></div>
                <div><dt className="text-sm uppercase tracking-widest text-white/60">Teléfono / WhatsApp</dt><dd><a className="underline" href={TEL_HREF}>{TEL}</a></dd></div>
                <div><dt className="text-sm uppercase tracking-widest text-white/60">Correo</dt><dd><a className="underline" href={`mailto:${MAIL}`}>{MAIL}</a> · <a className="underline" href="mailto:marketing@companyimc.com">marketing@companyimc.com</a></dd></div>
              </dl>
            </div>
            {/* Sitio estático sin backend: el formulario abre el correo del cliente. */}
            <form action={`mailto:${MAIL}`} method="post" encType="text/plain" className="space-y-4 rounded-3xl bg-white p-7 text-grafito">
              {[["nombre", "Tu nombre", "text"], ["correo", "Tu correo electrónico", "email"], ["asunto", "Asunto", "text"]].map(([n, l, t]) => (
                <label key={n} className="block text-sm font-semibold">{l}
                  <input name={n} type={t} required className="mt-1 w-full rounded-xl border-2 border-gris px-4 py-3 font-normal outline-none focus:border-azul-2" />
                </label>
              ))}
              <label className="block text-sm font-semibold">Tu mensaje (opcional)
                <textarea name="mensaje" rows={4} className="mt-1 w-full rounded-xl border-2 border-gris px-4 py-3 font-normal outline-none focus:border-azul-2" />
              </label>
              <button className="w-full rounded-full bg-naranja py-3 font-bold hover:brightness-95">Enviar mensaje</button>
            </form>
          </div>
        </Seccion>
      </main>

      <footer className="bg-grafito px-5 py-10 text-sm text-white/70">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <span>© 2025 Company IMC E.I.R.L. Todos los derechos reservados.</span>
          <a href="https://kelqa.com" className="hover:text-naranja">Nuestra nueva marca: Kelqa →</a>
        </div>
      </footer>
    </>
  );
}
