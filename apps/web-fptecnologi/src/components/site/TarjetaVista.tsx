import type { CSSProperties } from 'react';
import Image from 'next/image';
import { Download, FileText, Globe, Link2, Mail, Phone, type LucideIcon } from 'lucide-react';
import { LinkedinIcon, WhatsAppIcon } from '@/components/site/icons';
import { CompartirTarjeta } from '@/components/site/CompartirTarjeta';
import { imagenLanding } from '@/lib/landings';

export type EstiloTarjeta = 'clasico' | 'moderno' | 'oscuro' | 'minimal';
export interface DatosTarjeta {
  slug: string; estilo: EstiloTarjeta; vista: 'perfil' | 'linktree'; nombre: string; cargo: string | null; area: string | null; bio: string | null; fotoUrl: string | null; portadaUrl?: string | null; cotizarUrl?: string | null; telefono: string | null;
  whatsapp: string | null; email: string | null; linkedin: string | null; web: string | null; agendaUrl: string | null;
  enlaces: { titulo: string; url: string }[]; empresa: string; url: string; qr: string | null;
  /** Identidad de la marca: sin portada propia, el encabezado usa su color y su logo. */
  marca?: { logo: string | null; colorPrimario: string | null; colorSecundario: string | null; web?: string | null } | null;
  /** Bloques que su dueño ocultó (false). Lo no listado se muestra. */
  mostrar?: Partial<Record<'cotizar' | 'vcard' | 'compartir' | 'qr', boolean>>;
}

/* Estilos de la tarjeta (el mismo que se elige en el dashboard y que se usa en la tarjeta descargable). */
const ESTILO: Record<EstiloTarjeta, { fondo: string; portada: string; avatar: boolean; panel: string; texto: string; suave: string; acento: string; tile: string; icono: string; qrFondo: string }> = {
  clasico: {
    fondo: 'bg-paper', portada: 'bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800', avatar: false, panel: 'bg-white shadow-2xl shadow-brand-950/15',
    texto: 'text-ink', suave: 'text-ink/65', acento: 'text-brand-700', tile: 'hover:bg-brand-50', icono: 'bg-brand-primary text-white', qrFondo: 'bg-brand-50',
  },
  moderno: {
    fondo: 'bg-gradient-to-br from-brand-50 via-white to-brand-100', portada: 'bg-gradient-to-tr from-brand-700 via-brand-500 to-brand-300', avatar: true, panel: 'bg-white/90 shadow-2xl shadow-brand-950/10 backdrop-blur',
    texto: 'text-ink', suave: 'text-ink/65', acento: 'text-brand-600', tile: 'hover:bg-brand-50', icono: 'bg-gradient-to-br from-brand-400 to-brand-700 text-white', qrFondo: 'bg-brand-50',
  },
  oscuro: {
    fondo: 'bg-ink', portada: 'bg-gradient-to-br from-brand-900 via-brand-800 to-ink', avatar: true, panel: 'bg-white/[0.06] shadow-2xl shadow-black/40 ring-1 ring-white/10',
    texto: 'text-white', suave: 'text-white/65', acento: 'text-brand-300', tile: 'hover:bg-white/10', icono: 'bg-brand-primary text-white', qrFondo: 'bg-white/10',
  },
  minimal: {
    fondo: 'bg-white', portada: 'bg-brand-50', avatar: true, panel: 'bg-white shadow-xl shadow-ink/10 ring-1 ring-ink/5',
    texto: 'text-ink', suave: 'text-ink/60', acento: 'text-brand-700', tile: 'hover:bg-brand-50', icono: 'bg-ink text-white', qrFondo: 'bg-brand-50',
  },
};

/* Botones del diseño tipo Linktree, por estilo. */
const BOTON: Record<EstiloTarjeta, string> = {
  clasico: 'bg-white text-ink ring-1 ring-brand-primary/30 shadow-sm hover:bg-brand-primary hover:text-white',
  moderno: 'bg-gradient-to-r from-brand-600 to-brand-400 text-white shadow-lg shadow-brand-primary/30 hover:brightness-110',
  oscuro: 'bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20',
  minimal: 'bg-white text-ink ring-1 ring-ink/80 hover:bg-ink hover:text-white',
};

/** Paleta de la marca: se generan los tonos 50–950 a partir de su color principal y secundario (sin tocar la paleta global). */
function paletaMarca(p: string, s: string): CSSProperties {
  const mix = (c: string, pct: number, con = 'white') => `color-mix(in srgb, ${c} ${pct}%, ${con})`;
  const t600 = `color-mix(in srgb, ${p} 55%, ${s})`;
  return {
    '--color-brand-50': mix(p, 8), '--color-brand-100': mix(p, 16), '--color-brand-200': mix(p, 32), '--color-brand-300': mix(p, 55), '--color-brand-400': mix(p, 78),
    '--color-brand-500': p, '--color-brand-600': t600, '--color-brand-700': s,
    '--color-brand-800': mix(s, 78, 'black'), '--color-brand-900': mix(s, 58, 'black'), '--color-brand-950': mix(s, 36, 'black'),
    '--color-brand-primary': p, '--color-brand-dark': t600, '--color-brand-petrol': t600, '--color-brand-teal': mix(p, 78), '--color-brand-teal-light': mix(p, 55),
    '--color-paper': mix(p, 8),
  } as CSSProperties;
}

/** Fondo decorativo de la página: puntos de la marca y resplandores suaves (cambia con el estilo). */
function Decor({ estilo }: { estilo: EstiloTarjeta }) {
  const oscuro = estilo === 'oscuro';
  const tenue = estilo === 'minimal' ? 0.55 : 1;
  const punto = oscuro ? 'rgba(255,255,255,.10)' : 'color-mix(in srgb, var(--color-brand-600) 17%, transparent)';
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" style={{ opacity: tenue }}>
      <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(circle, ${punto} 1.2px, transparent 1.4px)`, backgroundSize: '22px 22px', maskImage: 'linear-gradient(to bottom, black 20%, transparent 95%)', WebkitMaskImage: 'linear-gradient(to bottom, black 20%, transparent 95%)' }} />
      <div className="absolute -left-40 -top-44 h-[36rem] w-[36rem] rounded-full blur-3xl" style={{ background: `color-mix(in srgb, var(--color-brand-${oscuro ? 500 : 300}) ${oscuro ? 30 : 42}%, transparent)` }} />
      <div className="absolute -bottom-52 -right-40 h-[32rem] w-[32rem] rounded-full blur-3xl" style={{ background: `color-mix(in srgb, var(--color-brand-${oscuro ? 700 : 400}) ${oscuro ? 38 : 28}%, transparent)` }} />
    </div>
  );
}

/** El QR (SVG de la API) como imagen: así nunca ejecuta nada, venga de donde venga. */
function Qr({ svg, className, label }: { svg: string; className: string; label: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img alt={label} className={className} src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`} />;
}

/** Página pública de la tarjeta digital. La usan /tarjeta/<enlace> y la vista previa del dashboard (/tarjeta/vista-previa). */
export function TarjetaVista({ t }: { t: DatosTarjeta }) {
  const e = ESTILO[t.estilo] ?? ESTILO.clasico;
  const m = t.mostrar ?? {};
  const verCotizar = m.cotizar !== false;
  // Enlace propio del botón de cotización; sin él, el cotizador de la web.
  const hrefCotizar = t.cotizarUrl || '/cotizador';
  const cotizarExterno = /^https?:\/\//i.test(hrefCotizar);
  const verVcard = m.vcard !== false;
  const verCompartir = m.compartir !== false;
  const qr = m.qr === false ? null : t.qr;
  const inicial = t.nombre.trim().charAt(0).toUpperCase();
  // Encabezado de portada + foto como avatar circular en todos los estilos. Sin portada propia: fondo de la marca con el logo.
  const conAvatar = true;
  const colorMarca = t.marca?.colorPrimario || null;
  const varsMarca = colorMarca ? paletaMarca(colorMarca, t.marca?.colorSecundario || colorMarca) : undefined;
  const estiloPortada = t.portadaUrl
    ? { backgroundImage: `url("${t.portadaUrl.replace(/"/g, '%22')}")`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : undefined;
  // Logo de la marca en blanco sobre su color; si la marca no cargó el suyo, el de FPTecnologi.
  const urlLogo = t.marca?.logo ? imagenLanding(t.marca.logo) : '/logo-fptecnologi.svg';
  // Puntos y logo en marca de agua sobre la portada por defecto.
  const decorPortada = (
    <>
      <span aria-hidden className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,.22) 1.2px, transparent 1.4px)', backgroundSize: '18px 18px' }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img aria-hidden src={urlLogo} alt="" className="absolute -bottom-12 -right-10 h-44 w-auto object-contain opacity-[0.07] brightness-0 invert" />
    </>
  );
  const logoMarca = (alto: string) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={urlLogo} alt={t.empresa} className={`relative ${alto} w-auto max-w-[70%] object-contain brightness-0 invert opacity-95`} />
  );
  const wa = t.whatsapp ? `https://wa.me/${t.whatsapp}?text=${encodeURIComponent(`Hola ${t.nombre.split(' ')[0]}, vi tu tarjeta digital de ${t.empresa} y quiero más información.`)}` : null;
  // La web de la marca (su primer dominio) va como pie de la tarjeta.
  const webMarca = t.marca?.web ?? null;
  const pieWeb = webMarca ? (
    <a href={webMarca} target="_blank" rel="noreferrer" className={`inline-flex items-center gap-1.5 text-sm font-medium hover:underline ${e.suave}`}>
      <Globe className="h-4 w-4" strokeWidth={1.9} /> {webMarca.replace(/^https?:\/\//, '')}
    </a>
  ) : null;
  const claseCompartir = `inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-[15px] font-semibold ring-1 transition-colors ${t.estilo === 'oscuro' ? 'text-white ring-white/25 hover:bg-white/10' : 'text-brand-700 ring-brand-primary/40 hover:bg-brand-50'}`;

  if (t.vista === 'linktree') {
    const Boton = ({ href, Icon, children, externo = true }: { href: string; Icon: LucideIcon | typeof WhatsAppIcon; children: React.ReactNode; externo?: boolean }) => (
      <a href={href} {...(externo ? { target: '_blank', rel: 'noreferrer' } : {})} className={`flex w-full items-center gap-3 rounded-full px-5 py-4 text-[15px] font-semibold transition-all hover:-translate-y-0.5 ${BOTON[t.estilo] ?? BOTON.clasico}`}>
        <Icon className="h-5 w-5 shrink-0" strokeWidth={1.9} />
        <span className="min-w-0 flex-1 break-words text-center">{children}</span>
        <span aria-hidden className="w-5 shrink-0" />
      </a>
    );
    return (
      <div className={`relative isolate min-h-screen overflow-hidden ${e.fondo}`} style={varsMarca}>
      <Decor estilo={t.estilo} />
        <main className="mx-auto flex w-full max-w-md flex-col items-center px-5 pb-10 pt-10 text-center">
          <div aria-hidden className={`relative -mb-14 flex h-32 w-full items-center justify-center overflow-hidden rounded-2xl ${t.portadaUrl ? 'bg-brand-50' : e.portada}`} style={estiloPortada}>
            {!t.portadaUrl && decorPortada}
            {!t.portadaUrl && logoMarca('h-9')}
          </div>
          <div className={`relative h-28 w-28 overflow-hidden rounded-full border-4 border-white shadow-lg ${e.portada}`}>
            {t.fotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={t.fotoUrl} alt={t.nombre} className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center font-display text-5xl font-bold text-white/80">{inicial}</span>
            )}
          </div>
          <h1 className={`mt-4 font-display text-2xl font-bold ${e.texto}`}>{t.nombre}</h1>
          {(t.cargo || t.area) && <p className={`mt-1 text-[15px] ${e.suave}`}>{[t.cargo, t.area].filter(Boolean).join(' · ')}</p>}
          <p className={`text-sm italic ${e.suave}`}>{t.empresa}</p>
          {t.bio && <p className={`mt-3 text-sm leading-relaxed ${e.suave}`}>{t.bio}</p>}

          <div className="mt-6 flex w-full flex-col gap-3">
            {wa && <Boton href={wa} Icon={WhatsAppIcon}>Escríbeme por WhatsApp</Boton>}
            {t.enlaces.map((l, i) => <Boton key={`${l.url}-${i}`} href={l.url} Icon={Link2}>{l.titulo}</Boton>)}
            {verCotizar && <Boton href={hrefCotizar} Icon={FileText} externo={cotizarExterno}>Pide una cotización</Boton>}
            {t.linkedin && <Boton href={t.linkedin} Icon={LinkedinIcon}>LinkedIn</Boton>}
            {t.email && <Boton href={`mailto:${t.email}`} Icon={Mail} externo={false}>{t.email}</Boton>}
            {t.telefono && <Boton href={`tel:${t.telefono.replace(/[^\d+]/g, '')}`} Icon={Phone} externo={false}>{t.telefono}</Boton>}
            {verVcard && <Boton href={`/api/tarjeta/${t.slug}/vcard`} Icon={Download} externo={false}>Guardar mi contacto</Boton>}
          </div>

          {verCompartir && (
            <div className="mt-6 flex items-center gap-3">
              <CompartirTarjeta url={t.url} nombre={t.nombre} className={claseCompartir} />
            </div>
          )}
          {qr && <Qr svg={qr} label="Código QR de esta tarjeta" className="mt-6 h-28 w-28 rounded-xl bg-white p-2 shadow-md" />}
          <Image src="/logo-fptecnologi.svg" alt={t.empresa} width={130} height={32} className={`mt-8 h-7 w-auto opacity-80 ${t.estilo === 'oscuro' ? 'brightness-0 invert' : ''}`} />
          {pieWeb && <div className="mt-3">{pieWeb}</div>}
        </main>
      </div>
    );
  }

  const Accion = ({ href, Icon, children, externo = true }: { href: string; Icon: LucideIcon | typeof WhatsAppIcon; children: React.ReactNode; externo?: boolean }) => (
    <a href={href} {...(externo ? { target: '_blank', rel: 'noreferrer' } : {})} className={`group flex items-center gap-3.5 rounded-2xl px-3 py-3 transition-colors ${e.tile}`}>
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-transform group-hover:scale-110 ${e.icono}`}>
        <Icon className="h-5 w-5" strokeWidth={1.9} />
      </span>
      <span className={`min-w-0 break-words text-[15px] font-medium ${e.texto}`}>{children}</span>
    </a>
  );

  const foto = t.fotoUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={t.fotoUrl} alt={t.nombre} className={conAvatar ? 'h-full w-full object-cover' : 'absolute inset-0 h-full w-full object-cover object-top'} />
  ) : (
    <span className={`flex items-center justify-center font-display font-bold ${conAvatar ? 'h-full w-full text-5xl text-white/80' : 'absolute inset-0 text-8xl text-white/30'}`}>{inicial}</span>
  );
  const hayContacto = !!(wa || t.telefono || t.email || t.linkedin || verCotizar);

  return (
    <div className={`relative isolate min-h-screen overflow-hidden ${e.fondo}`} style={varsMarca}>
      <Decor estilo={t.estilo} />
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 pt-5">
        <Image src="/logo-fptecnologi.svg" alt={t.empresa} width={150} height={36} className={`h-8 w-auto ${t.estilo === 'oscuro' ? 'brightness-0 invert' : ''}`} />
        <span className={`text-xs font-semibold uppercase tracking-[0.18em] ${e.suave}`}>Tarjeta digital</span>
      </header>

      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-6 sm:py-10 lg:grid-cols-[22rem_1fr] lg:items-start lg:gap-8">
        {/* Perfil */}
        <section className={`overflow-hidden rounded-[2rem] lg:sticky lg:top-6 ${e.panel}`}>
          <div className={`relative flex items-center justify-center overflow-hidden ${conAvatar ? 'h-36' : 'h-72'} ${e.portada}`} style={estiloPortada}>
            {!t.portadaUrl && decorPortada}
            {!t.portadaUrl && logoMarca('h-9')}
            {!conAvatar && foto}
            {!conAvatar && (
              <svg aria-hidden viewBox="0 0 400 60" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-12 w-full text-white">
                <path d="M0 60V28C80 -4 160 -4 240 18s120 20 160 -2V60z" fill="currentColor" />
              </svg>
            )}
          </div>
          {conAvatar && <div className="relative z-10 -mt-14 ml-6 h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-brand-600 shadow-lg">{foto}</div>}
          <div className={`px-6 pb-6 ${conAvatar ? 'pt-3' : 'pt-1'}`}>
            <h1 className={`font-display text-2xl font-bold ${e.texto}`}>{t.nombre}</h1>
            {t.cargo && <p className={`mt-0.5 text-[15px] ${e.suave}`}>{t.cargo}</p>}
            {t.area && <p className={`mt-0.5 text-sm font-semibold ${e.acento}`}>{t.area}</p>}
            <p className={`mt-0.5 text-sm italic ${e.suave}`}>{t.empresa}</p>
            {t.bio && <p className={`mt-4 text-sm leading-relaxed ${e.suave}`}>{t.bio}</p>}
            {(verVcard || verCompartir) && (
              <div className="mt-5 flex flex-wrap gap-2">
                {verVcard && (
                  <a href={`/api/tarjeta/${t.slug}/vcard`} className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-brand-primary px-5 py-3 text-[15px] font-semibold text-white shadow-lg shadow-brand-primary/30 transition-colors hover:bg-brand-dark">
                    <Download className="h-[18px] w-[18px]" strokeWidth={2} /> Guardar contacto
                  </a>
                )}
                {verCompartir && <CompartirTarjeta url={t.url} nombre={t.nombre} className={claseCompartir} />}
              </div>
            )}
          </div>
        </section>

        {/* Contacto, enlaces y QR */}
        {(hayContacto || t.enlaces.length > 0 || qr) && (
          <section className={`rounded-[2rem] p-3 sm:p-5 ${e.panel}`}>
            {hayContacto && (
              <>
                <h2 className={`px-3 pb-2 pt-2 text-xs font-bold uppercase tracking-[0.18em] ${e.acento}`}>Contacto</h2>
                <div className="grid gap-1 sm:grid-cols-2">
                  {wa && <Accion href={wa} Icon={WhatsAppIcon}>Escríbeme por WhatsApp</Accion>}
                  {t.telefono && <Accion href={`tel:${t.telefono.replace(/[^\d+]/g, '')}`} Icon={Phone} externo={false}>{t.telefono}</Accion>}
                  {t.email && <Accion href={`mailto:${t.email}`} Icon={Mail} externo={false}>{t.email}</Accion>}
                  {t.linkedin && <Accion href={t.linkedin} Icon={LinkedinIcon}>Conecta conmigo en LinkedIn</Accion>}
                  {verCotizar && <Accion href={hrefCotizar} Icon={FileText} externo={cotizarExterno}>Pide una cotización</Accion>}
                </div>
              </>
            )}

            {t.enlaces.length > 0 && (
              <>
                <h2 className={`px-3 pb-2 pt-6 text-xs font-bold uppercase tracking-[0.18em] ${e.acento}`}>Más para ti</h2>
                <div className="grid gap-1 sm:grid-cols-2">{t.enlaces.map((l, i) => <Accion key={`${l.url}-${i}`} href={l.url} Icon={Link2}>{l.titulo}</Accion>)}</div>
              </>
            )}

            {qr && (
              <div className={`mt-6 flex items-center gap-4 rounded-2xl p-4 ${e.qrFondo}`}>
                <Qr svg={qr} label="Código QR de esta tarjeta" className="h-28 w-28 shrink-0 rounded-xl bg-white p-2" />
                <p className={`text-sm leading-relaxed ${e.suave}`}>Escanea el código para abrir esta tarjeta en otro celular y guardar mi contacto.</p>
              </div>
            )}
          </section>
        )}
      </main>
      {pieWeb && <footer className="mx-auto max-w-5xl px-5 pb-8 text-center">{pieWeb}</footer>}
    </div>
  );
}
