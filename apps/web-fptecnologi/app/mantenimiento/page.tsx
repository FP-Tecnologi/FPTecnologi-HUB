import type { Metadata } from 'next';
import { getPagina } from '@/lib/paginasContenido';
import { getSitio } from '@/lib/sitio';

// Pantalla "estamos trabajando" (se muestra por middleware.ts cuando se activa en el dashboard).
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Estamos trabajando',
  robots: { index: false, follow: false },
};

export default async function Mantenimiento() {
  const [{ mantenimiento }, sitio] = await Promise.all([getPagina('sitio'), getSitio()]);
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.25rem',
        padding: '2rem 1.5rem',
        textAlign: 'center',
        background: 'linear-gradient(160deg, #04122a 0%, #0a2a5c 55%, #2898ee 140%)',
        color: '#fff',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-fptecnologi.svg" alt="FPTecnologi & System" style={{ height: 56, width: 'auto', filter: 'brightness(0) invert(1)' }} />
      <h1 style={{ margin: 0, fontSize: 'clamp(1.6rem, 4vw, 2.6rem)', fontWeight: 800, lineHeight: 1.15, maxWidth: '24ch' }}>{mantenimiento.titulo}</h1>
      <p style={{ margin: 0, maxWidth: '52ch', fontSize: '1.05rem', lineHeight: 1.6, opacity: 0.9 }}>{mantenimiento.mensaje}</p>
      {mantenimiento.detalle && (
        <p style={{ margin: 0, padding: '.5rem 1rem', borderRadius: 999, background: 'rgba(255,255,255,.12)', fontWeight: 600 }}>{mantenimiento.detalle}</p>
      )}
      <a
        href={`https://wa.me/${sitio.whatsapp}`}
        style={{ marginTop: '.5rem', padding: '.8rem 1.4rem', borderRadius: 12, background: '#fff', color: '#0a2a5c', fontWeight: 700, textDecoration: 'none' }}
      >
        Escríbenos por WhatsApp
      </a>
      {sitio.contact.email && <p style={{ margin: 0, opacity: 0.8, fontSize: '.95rem' }}>{sitio.contact.email}</p>}
    </main>
  );
}
