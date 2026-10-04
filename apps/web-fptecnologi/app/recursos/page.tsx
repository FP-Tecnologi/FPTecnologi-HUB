import { cookies } from 'next/headers';
import { TiendaBar } from '@/components/tienda/TiendaBar';
import { LoginCuenta } from '@/components/cuenta/LoginCuenta';
import { RecursosView } from '@/components/cuenta/RecursosView';
import { Footer } from '@/components/home/Footer';
import { COOKIE_CUENTA, getRecursosSocio } from '@/lib/cuenta';

export const metadata = { title: 'Recursos para socios', robots: { index: false } };
// Depende de la cookie de sesión: nunca se cachea.
export const dynamic = 'force-dynamic';

/* Recursos: material de marcas (logos, fichas, banners, videos) solo para socios. Entra con el mismo código por correo
   de «Mi cuenta»; el equipo autoriza los correos y sube el material desde el dashboard → Recursos. */
export default async function RecursosPage() {
  const token = (await cookies()).get(COOKIE_CUENTA)?.value;
  const r = await getRecursosSocio(token);
  return (
    <>
      <TiendaBar crumbs={[{ label: 'Recursos' }]} titulo="Recursos para socios" />
      <main className="min-h-[60vh] bg-paper pb-20 pt-10">
        <div className="mx-auto max-w-7xl px-6">
          {r.estado === 'ok' ? (
            <RecursosView socio={r.socio} recursos={r.recursos} />
          ) : r.estado === 'sinAcceso' ? (
            <div className="mx-auto max-w-lg rounded-2xl bg-white p-8 text-center shadow-lg shadow-brand-950/10">
              <h2 className="font-display text-2xl font-bold text-ink">Tu correo no es de un socio</h2>
              <p className="mt-2 text-sm text-ink/65">Este material es solo para socios de FP Tecnologi. Si quieres ser socio, escríbenos y lo habilitamos.</p>
              <a href="/contacto" className="mt-5 inline-flex rounded-xl bg-brand-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700">Contactar</a>
            </div>
          ) : r.estado === 'error' ? (
            <p className="text-center text-sm text-ink/65">No pudimos cargar los recursos. Inténtalo de nuevo en unos minutos.</p>
          ) : (
            <LoginCuenta socio />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
