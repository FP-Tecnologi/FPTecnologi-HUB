import { TiendaBar } from '@/components/tienda/TiendaBar';
import { RegistroSocio } from '@/components/cuenta/RegistroSocio';
import { Footer } from '@/components/home/Footer';

export const metadata = { title: 'Registro de socios' };

/* Solicitud de acceso a la intranet de socios (la aprueba el equipo desde el dashboard). */
export default function RegistroSociosPage() {
  return (
    <>
      <TiendaBar crumbs={[{ label: 'Socios', href: '/socios' }, { label: 'Registro' }]} titulo="Conviértete en socio" />
      <main className="relative min-h-[60vh] bg-paper pb-20 pt-10">
        <div className="mx-auto max-w-7xl px-6">
          <RegistroSocio />
        </div>
      </main>
      <Footer />
    </>
  );
}
