import { cookies } from 'next/headers';
import { TiendaBar } from '@/components/tienda/TiendaBar';
import { LoginCuenta } from '@/components/cuenta/LoginCuenta';
import { SociosPortal } from '@/components/cuenta/SociosPortal';
import { Footer } from '@/components/home/Footer';
import { COOKIE_CUENTA, getPortalSocio } from '@/lib/cuenta';

export const metadata = { title: 'Intranet de socios', robots: { index: false } };
// Depende de la cookie de sesión: nunca se cachea.
export const dynamic = 'force-dynamic';

const MENSAJE = {
  PENDIENTE: { t: 'Tu solicitud está en revisión', d: 'Nuestro equipo la está revisando. Te avisaremos por correo cuando tengas acceso a la intranet.' },
  SUSPENDIDO: { t: 'Tu acceso está suspendido', d: 'Tu acceso a la intranet de socios está suspendido. Escríbenos para revisarlo.' },
  RECHAZADO: { t: 'No pudimos aprobar tu solicitud', d: 'Tu solicitud de socio no fue aprobada. Si crees que es un error, escríbenos.' },
  NINGUNO: { t: 'Tu correo aún no es de un socio', d: 'Este correo no está registrado como socio de FP Tecnologi. Puedes pedir tu acceso y lo revisamos.' },
} as const;

/* Intranet de socios: recursos de marcas, soporte y datos de la empresa. Entra con el mismo código por correo de
   «Mi cuenta»; el equipo aprueba cada socio desde el dashboard → Web → Recursos. */
export default async function SociosPage() {
  const token = (await cookies()).get(COOKIE_CUENTA)?.value;
  const r = await getPortalSocio(token);
  const m = r.estado === 'sinAcceso' ? MENSAJE[r.socio ?? 'NINGUNO'] : null;
  return (
    <>
      <TiendaBar crumbs={[{ label: 'Socios' }]} titulo="Intranet de socios" />
      <main className="min-h-[60vh] bg-paper pb-20 pt-10">
        <div className="mx-auto max-w-7xl px-6">
          {r.estado === 'ok' ? (
            <SociosPortal portal={r} />
          ) : m ? (
            <div className="mx-auto max-w-lg rounded-2xl bg-white p-8 text-center shadow-lg shadow-brand-950/10">
              <h2 className="font-display text-2xl font-bold text-ink">{m.t}</h2>
              <p className="mt-2 text-sm text-ink/65">{m.d}</p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                {(r.estado === 'sinAcceso' && (r.socio === null || r.socio === 'RECHAZADO')) && <a href="/socios/registro" className="inline-flex rounded-xl bg-brand-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700">Pedir acceso</a>}
                <a href="/contacto" className="inline-flex rounded-xl bg-brand-100 px-5 py-3 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-primary hover:text-white">Contactar</a>
              </div>
            </div>
          ) : r.estado === 'error' ? (
            <p className="text-center text-sm text-ink/65">No pudimos cargar la intranet. Inténtalo de nuevo en unos minutos.</p>
          ) : (
            <div>
              <LoginCuenta socio />
              <p className="mt-5 text-center text-sm text-ink/65">¿Aún no eres socio? <a href="/socios/registro" className="font-semibold text-brand-700 hover:underline">Regístrate aquí</a></p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
