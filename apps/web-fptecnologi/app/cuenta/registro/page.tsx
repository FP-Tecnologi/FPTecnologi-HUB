import { TiendaBar } from '@/components/tienda/TiendaBar';
import { RegistroCliente } from '@/components/cuenta/RegistroCliente';
import { Footer } from '@/components/home/Footer';

export const metadata = { title: 'Crear cuenta', robots: { index: false } };

/* Registro de cliente (los socios se registran en /socios/registro, con otros datos y aprobación del equipo). */
export default function RegistroClientePage() {
  return (
    <>
      <TiendaBar crumbs={[{ label: 'Acceso', href: '/acceso' }, { label: 'Crear cuenta' }]} titulo="Crea tu cuenta" />
      <main id="contenido" className="min-h-[60vh] bg-paper pb-20 pt-10">
        <div className="mx-auto max-w-7xl px-6">
          <RegistroCliente />
        </div>
      </main>
      <Footer />
    </>
  );
}
