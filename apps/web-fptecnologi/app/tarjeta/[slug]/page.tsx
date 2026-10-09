import Image from 'next/image';
import { notFound } from 'next/navigation';
import { CalendarCheck, Download, FileText, Globe, Link2, Mail, Phone, type LucideIcon } from 'lucide-react';
import { LinkedinIcon, WhatsAppIcon } from '@/components/site/icons';
import { CompartirTarjeta } from '@/components/site/CompartirTarjeta';

export const dynamic = 'force-dynamic';

const API_URL = process.env.HUB_API_URL ?? 'http://localhost:3001';
const MARCA_ID = process.env.HUB_MARCA_ID ?? '';

type Estilo = 'clasico' | 'moderno' | 'oscuro' | 'minimal';
interface Tarjeta {
  slug: string; estilo: Estilo; vista: 'perfil' | 'linktree'; nombre: string; cargo: string | null; area: string | null; bio: string | null; fotoUrl: string | null; telefono: string | null;
  whatsapp: string | null; email: string | null; linkedin: string | null; web: string | null; agendaUrl: string | null;
  enlaces: { titulo: string; url: string }[]; empresa: string; url: string; qr: string;
}

async function cargar(slug: string): Promise<Tarjeta | null> {
  if (!MARCA_ID || !/^[a-z0-9-]{3,60}$/.test(slug)) return null;
  try {
    const res = await fetch(`${API_URL}/public/tarjetas/${slug}?marcaId=${encodeURIComponent(MARCA_ID)}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json())?.data ?? null;
  } catch {
    return null;
  }
}

// La tarjeta es para compartir por QR o enlace, no para aparecer en Google.
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const t = await cargar((await params).slug);
  return { title: t ? t.nombre : 'Tarjeta digital', robots: { index: false, follow: false } };
}

/* Estilos de la tarjeta (el mismo que se elige en el dashboard y que se usa en la tarjeta descargable). */
const ESTILO: Record<Estilo, { fondo: string; portada: string; avatar: boolean; panel: string; texto: string; suave: string; acento: string; tile: string; icono: string; qrFondo: string }> = {
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
const BOTON: Record<Estilo, string> = {
  clasico: 'bg-white text-ink ring-1 ring-brand-primary/30 shadow-sm hover:bg-brand-primary hover:text-white',
  moderno: 'bg-gradient-to-r from-brand-600 to-brand-400 text-white shadow-lg shadow-brand-primary/30 hover:brightness-110',
  oscuro: 'bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/20',
  minimal: 'bg-white text-ink ring-1 ring-ink/80 hover:bg-ink hover:text-white',
};

export default async function TarjetaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = await cargar(slug);
  if (!t) notFound();
  const e = ESTILO[t.estilo] ?? ESTILO.clasico;
  const inicial = t.nombre.trim().charAt(0).toUpperCase();
  const wa = t.whatsapp ? `https://wa.me/${t.whatsapp}?text=${encodeURIComponent(`Hola ${t.nombre.split(' ')[0]}, vi tu tarjeta digital de ${t.empresa} y quiero más información.`)}` : null;

  if (t.vista === 'linktree') {
    const Boton = ({ href, Icon, children, externo = true }: { href: string; Icon: LucideIcon | typeof WhatsAppIcon; children: React.ReactNode; externo?: boolean }) => (
      <a href={href} {...(externo ? { target: '_blank', rel: 'noreferrer' } : {})} className={`flex w-full items-center gap-3 rounded-full px-5 py-4 text-[15px] font-semibold transition-all hover:-translate-y-0.5 ${BOTON[t.estilo] ?? BOTON.clasico}`}>
        <Icon className="h-5 w-5 shrink-0" strokeWidth={1.9} />
        <span className="min-w-0 flex-1 break-words text-center">{children}</span>
        <span aria-hidden className="w-5 shrink-0" />
      </a>
    );
    return (
      <div className={`min-h-screen ${e.fondo}`}>
        <main className="mx-auto flex w-full max-w-md flex-col items-center px-5 pb-10 pt-10 text-center">
          <div className={`h-28 w-28 overflow-hidden rounded-full border-4 border-white shadow-lg ${e.portada} ${e.avatar ? '' : 'relative'}`}>
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
            {t.agendaUrl && <Boton href={t.agendaUrl} Icon={CalendarCheck}>Agenda una reunión</Boton>}
            {t.enlaces.map((l) => <Boton key={l.url} href={l.url} Icon={Link2}>{l.titulo}</Boton>)}
            <Boton href="/cotizador" Icon={FileText} externo={false}>Pide una cotización</Boton>
            {t.web && <Boton href={t.web} Icon={Globe}>Visita nuestra web</Boton>}
            {t.linkedin && <Boton href={t.linkedin} Icon={LinkedinIcon}>LinkedIn</Boton>}
            {t.email && <Boton href={`mailto:${t.email}`} Icon={Mail} externo={false}>{t.email}</Boton>}
            {t.telefono && <Boton href={`tel:${t.telefono.replace(/[^\d+]/g, '')}`} Icon={Phone} externo={false}>{t.telefono}</Boton>}
            <Boton href={`/api/tarjeta/${t.slug}/vcard`} Icon={Download} externo={false}>Guardar mi contacto</Boton>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <CompartirTarjeta url={t.url} nombre={t.nombre} className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold ring-1 transition-colors ${t.estilo === 'oscuro' ? 'text-white ring-white/25 hover:bg-white/10' : 'text-brand-700 ring-brand-primary/40 hover:bg-brand-50'}`} />
          </div>
          <div aria-label="Código QR de esta tarjeta" className="mt-6 h-28 w-28 rounded-xl bg-white p-2 shadow-md [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: t.qr }} />
          <Image src="/logo-fptecnologi.svg" alt={t.empresa} width={130} height={32} className={`mt-8 h-7 w-auto opacity-80 ${t.estilo === 'oscuro' ? 'brightness-0 invert' : ''}`} />
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
    <img src={t.fotoUrl} alt={t.nombre} className={e.avatar ? 'h-full w-full object-cover' : 'absolute inset-0 h-full w-full object-cover object-top'} />
  ) : (
    <span className={`flex items-center justify-center font-display font-bold ${e.avatar ? 'h-full w-full text-5xl text-white/80' : 'absolute inset-0 text-8xl text-white/30'}`}>{inicial}</span>
  );

  return (
    <div className={`min-h-screen ${e.fondo}`}>
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 pt-5">
        <Image src="/logo-fptecnologi.svg" alt={t.empresa} width={150} height={36} className={`h-8 w-auto ${t.estilo === 'oscuro' ? 'brightness-0 invert' : ''}`} />
        <span className={`text-xs font-semibold uppercase tracking-[0.18em] ${e.suave}`}>Tarjeta digital</span>
      </header>

      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-6 sm:py-10 lg:grid-cols-[22rem_1fr] lg:items-start lg:gap-8">
        {/* Perfil */}
        <section className={`overflow-hidden rounded-[2rem] lg:sticky lg:top-6 ${e.panel}`}>
          <div className={`relative ${e.avatar ? 'h-36' : 'h-72'} ${e.portada}`}>
            {!e.avatar && foto}
            {!e.avatar && (
              <svg aria-hidden viewBox="0 0 400 60" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-12 w-full text-white">
                <path d="M0 60V28C80 -4 160 -4 240 18s120 20 160 -2V60z" fill="currentColor" />
              </svg>
            )}
          </div>
          {e.avatar && <div className="relative z-10 -mt-14 ml-6 h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-brand-600 shadow-lg">{foto}</div>}
          <div className={`px-6 pb-6 ${e.avatar ? 'pt-3' : 'pt-1'}`}>
            <h1 className={`font-display text-2xl font-bold ${e.texto}`}>{t.nombre}</h1>
            {t.cargo && <p className={`mt-0.5 text-[15px] ${e.suave}`}>{t.cargo}</p>}
            {t.area && <p className={`mt-0.5 text-sm font-semibold ${e.acento}`}>{t.area}</p>}
            <p className={`mt-0.5 text-sm italic ${e.suave}`}>{t.empresa}</p>
            {t.bio && <p className={`mt-4 text-sm leading-relaxed ${e.suave}`}>{t.bio}</p>}
            <div className="mt-5 flex flex-wrap gap-2">
              <a href={`/api/tarjeta/${t.slug}/vcard`} className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-brand-primary px-5 py-3 text-[15px] font-semibold text-white shadow-lg shadow-brand-primary/30 transition-colors hover:bg-brand-dark">
                <Download className="h-[18px] w-[18px]" strokeWidth={2} /> Guardar contacto
              </a>
              <CompartirTarjeta url={t.url} nombre={t.nombre} className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-[15px] font-semibold ring-1 transition-colors ${t.estilo === 'oscuro' ? 'text-white ring-white/25 hover:bg-white/10' : 'text-brand-700 ring-brand-primary/40 hover:bg-brand-50'}`} />
            </div>
          </div>
        </section>

        {/* Contacto, enlaces y QR */}
        <section className={`rounded-[2rem] p-3 sm:p-5 ${e.panel}`}>
          <h2 className={`px-3 pb-2 pt-2 text-xs font-bold uppercase tracking-[0.18em] ${e.acento}`}>Contacto</h2>
          <div className="grid gap-1 sm:grid-cols-2">
            {wa && <Accion href={wa} Icon={WhatsAppIcon}>Escríbeme por WhatsApp</Accion>}
            {t.telefono && <Accion href={`tel:${t.telefono.replace(/[^\d+]/g, '')}`} Icon={Phone} externo={false}>{t.telefono}</Accion>}
            {t.email && <Accion href={`mailto:${t.email}`} Icon={Mail} externo={false}>{t.email}</Accion>}
            {t.agendaUrl && <Accion href={t.agendaUrl} Icon={CalendarCheck}>Agenda una reunión conmigo</Accion>}
            {t.linkedin && <Accion href={t.linkedin} Icon={LinkedinIcon}>Conecta conmigo en LinkedIn</Accion>}
            {t.web && <Accion href={t.web} Icon={Globe}>Visita nuestra web</Accion>}
            <Accion href="/cotizador" Icon={FileText} externo={false}>Pide una cotización</Accion>
          </div>

          {t.enlaces.length > 0 && (
            <>
              <h2 className={`px-3 pb-2 pt-6 text-xs font-bold uppercase tracking-[0.18em] ${e.acento}`}>Más para ti</h2>
              <div className="grid gap-1 sm:grid-cols-2">{t.enlaces.map((l) => <Accion key={l.url} href={l.url} Icon={Link2}>{l.titulo}</Accion>)}</div>
            </>
          )}

          <div className={`mt-6 flex items-center gap-4 rounded-2xl p-4 ${e.qrFondo}`}>
            <div aria-label="Código QR de esta tarjeta" className="h-28 w-28 shrink-0 rounded-xl bg-white p-2 [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: t.qr }} />
            <p className={`text-sm leading-relaxed ${e.suave}`}>Escanea el código para abrir esta tarjeta en otro celular y guardar mi contacto.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
