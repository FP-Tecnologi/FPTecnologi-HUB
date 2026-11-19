import { ArrowRight, Handshake, ShoppingBag, UserPlus, type LucideIcon } from 'lucide-react';
import { TiendaBar } from '@/components/tienda/TiendaBar';
import { Footer } from '@/components/home/Footer';

export const metadata = { title: 'Acceso', description: 'Elige cómo quieres ingresar: cliente, socio o solicitar ser partner.' };

type Opcion = {
  icono: LucideIcon;
  etiqueta: string;
  titulo: string;
  texto: string;
  acciones: { texto: string; href: string; principal?: boolean }[];
};

const OPCIONES: Opcion[] = [
  {
    icono: ShoppingBag,
    etiqueta: 'Clientes',
    titulo: 'Soy cliente',
    texto: 'Revisa tus pedidos y cotizaciones, y compra más rápido con tus datos guardados.',
    acciones: [
      { texto: 'Iniciar sesión', href: '/cuenta', principal: true },
      { texto: 'Crear cuenta', href: '/cuenta' },
    ],
  },
  {
    icono: Handshake,
    etiqueta: 'Socios',
    titulo: 'Soy socio',
    texto: 'Entra a la intranet de socios: recursos de marcas, soporte y condiciones comerciales.',
    acciones: [{ texto: 'Ingresar a la intranet', href: '/socios', principal: true }],
  },
  {
    icono: UserPlus,
    etiqueta: 'Programa de Partners',
    titulo: 'Quiero ser partner',
    texto: 'Solicita tu acceso. Nuestro equipo revisa tu solicitud y te avisa por correo.',
    acciones: [{ texto: 'Solicitar ser partner', href: '/socios/registro', principal: true }],
  },
];

/* Puerta de entrada: el icono de usuario del encabezado lleva aquí y la persona elige a dónde ir.
   Clientes y socios inician con el mismo código por correo; el sistema reconoce el rol por el correo. */
export default function AccesoPage() {
  return (
    <>
      <TiendaBar crumbs={[{ label: 'Acceso' }]} titulo="¿Cómo quieres ingresar?" />
      <main id="contenido" className="min-h-[60vh] bg-paper pb-20 pt-10">
        <div className="mx-auto max-w-6xl px-6">
          <p className="mx-auto mb-10 max-w-2xl text-center text-ink/60">
            Elige tu perfil. Ingresas con un código que te enviamos al correo, sin contraseña.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {OPCIONES.map((o) => (
              <section
                key={o.titulo}
                className="flex flex-col rounded-2xl border border-black/5 bg-white p-7 shadow-lg shadow-brand-dark/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-dark/20"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary text-white shadow-md shadow-brand-dark/30">
                  <o.icono className="h-6 w-6" strokeWidth={1.8} />
                </span>
                <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-brand-700">{o.etiqueta}</p>
                <h2 className="mt-1 font-display text-2xl font-bold text-ink">{o.titulo}</h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ink/60">{o.texto}</p>
                <div className="mt-6 flex flex-col gap-3">
                  {o.acciones.map((a) => (
                    <a
                      key={a.texto}
                      href={a.href}
                      className={
                        a.principal
                          ? 'inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark'
                          : 'inline-flex items-center justify-center gap-2 rounded-xl border border-brand-primary/30 px-5 py-3 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-primary/10'
                      }
                    >
                      {a.texto}
                      {a.principal && <ArrowRight className="h-4 w-4" />}
                    </a>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
