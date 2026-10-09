import Image from 'next/image';
import { notFound } from 'next/navigation';
import { CalendarCheck, Download, FileText, Globe, Link2, Mail, Phone, type LucideIcon } from 'lucide-react';
import { LinkedinIcon, WhatsAppIcon } from '@/components/site/icons';

export const dynamic = 'force-dynamic';

const API_URL = process.env.HUB_API_URL ?? 'http://localhost:3001';
const MARCA_ID = process.env.HUB_MARCA_ID ?? '';

interface Tarjeta {
  slug: string; nombre: string; cargo: string | null; area: string | null; bio: string | null; fotoUrl: string | null; telefono: string | null;
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

/** Acción de la tarjeta: ícono en círculo + texto, como una fila de contacto. */
function Accion({ href, Icon, children, externo = true }: { href: string; Icon: LucideIcon | typeof WhatsAppIcon; children: React.ReactNode; externo?: boolean }) {
  return (
    <a href={href} {...(externo ? { target: '_blank', rel: 'noreferrer' } : {})} className="group flex items-center gap-3.5 rounded-2xl px-2 py-2.5 transition-colors hover:bg-brand-50">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-primary text-white transition-transform group-hover:scale-110">
        <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
      </span>
      <span className="text-[15px] font-medium text-ink">{children}</span>
    </a>
  );
}

export default async function TarjetaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = await cargar(slug);
  if (!t) notFound();
  const inicial = t.nombre.trim().charAt(0).toUpperCase();
  const wa = t.whatsapp ? `https://wa.me/${t.whatsapp}?text=${encodeURIComponent(`Hola ${t.nombre.split(' ')[0]}, vi tu tarjeta digital de ${t.empresa} y quiero más información.`)}` : null;

  return (
    <main className="flex min-h-screen items-start justify-center bg-paper px-4 py-8 sm:py-12">
      <article className="w-full max-w-[26rem] overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-brand-950/15">
        {/* Portada con la foto; la base curva como en una tarjeta digital. */}
        <div className="relative h-80 bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800">
          {t.fotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={t.fotoUrl} alt={t.nombre} className="absolute inset-0 h-full w-full object-cover object-top" />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center font-display text-8xl font-bold text-white/30">{inicial}</span>
          )}
          <svg aria-hidden viewBox="0 0 400 60" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-12 w-full text-white">
            <path d="M0 60V28C80 -4 160 -4 240 18s120 20 160 -2V60z" fill="currentColor" />
          </svg>
          <Image src="/logo-fptecnologi-icon.svg" alt="" width={44} height={44} className="absolute bottom-2 right-5 h-11 w-11 rounded-xl bg-white p-1 shadow-md" />
        </div>

        <div className="px-6 pb-2 pt-1">
          <h1 className="font-display text-2xl font-bold text-ink">{t.nombre}</h1>
          {t.cargo && <p className="mt-0.5 text-[15px] text-ink/80">{t.cargo}</p>}
          {t.area && <p className="mt-0.5 text-sm font-semibold text-brand-700">{t.area}</p>}
          <p className="mt-0.5 text-sm italic text-ink/55">{t.empresa}</p>
          {t.bio && <p className="mt-4 text-sm leading-relaxed text-ink/70">{t.bio}</p>}
        </div>

        <div className="px-4 pb-2 pt-3">
          <a href={`/api/tarjeta/${t.slug}/vcard`} className="mb-2 flex items-center justify-center gap-2 rounded-2xl bg-brand-primary px-5 py-3 text-[15px] font-semibold text-white shadow-lg shadow-brand-primary/30 transition-colors hover:bg-brand-dark">
            <Download className="h-[18px] w-[18px]" strokeWidth={2} /> Guardar contacto
          </a>
          {wa && <Accion href={wa} Icon={WhatsAppIcon}>Escríbeme por WhatsApp</Accion>}
          {t.telefono && <Accion href={`tel:${t.telefono.replace(/[^\d+]/g, '')}`} Icon={Phone} externo={false}>{t.telefono}</Accion>}
          {t.email && <Accion href={`mailto:${t.email}`} Icon={Mail} externo={false}>{t.email}</Accion>}
          {t.agendaUrl && <Accion href={t.agendaUrl} Icon={CalendarCheck}>Agenda una reunión conmigo</Accion>}
          {t.linkedin && <Accion href={t.linkedin} Icon={LinkedinIcon}>Conecta conmigo en LinkedIn</Accion>}
          {t.web && <Accion href={t.web} Icon={Globe}>Visita nuestra web</Accion>}
          <Accion href="/cotizador" Icon={FileText} externo={false}>Pide una cotización</Accion>
          {t.enlaces.map((e) => <Accion key={e.url} href={e.url} Icon={Link2}>{e.titulo}</Accion>)}
        </div>

        <div className="mx-6 mb-6 mt-3 flex items-center gap-4 rounded-2xl bg-brand-50 p-4">
          <div aria-label="Código QR de esta tarjeta" className="h-24 w-24 shrink-0 rounded-xl bg-white p-1.5 [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: t.qr }} />
          <p className="text-xs leading-relaxed text-ink/65">Escanea el código para abrir esta tarjeta en otro celular y guardar mi contacto.</p>
        </div>
      </article>
    </main>
  );
}
