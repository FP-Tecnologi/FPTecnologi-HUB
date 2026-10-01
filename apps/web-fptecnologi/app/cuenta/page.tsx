import { cookies } from 'next/headers';
import { TiendaBar } from '@/components/tienda/TiendaBar';
import { LoginCuenta } from '@/components/cuenta/LoginCuenta';
import { MiCuentaView } from '@/components/cuenta/MiCuentaView';
import { Footer } from '@/components/home/Footer';
import { COOKIE_CUENTA, getResumenCuenta } from '@/lib/cuenta';

export const metadata = { title: 'Mi cuenta', robots: { index: false } };
// Depende de la cookie de sesión: nunca se cachea.
export const dynamic = 'force-dynamic';

export default async function CuentaPage() {
  const token = (await cookies()).get(COOKIE_CUENTA)?.value;
  const cuenta = await getResumenCuenta(token);
  return (
    <>
      <TiendaBar crumbs={[{ label: 'Mi cuenta' }]} titulo={cuenta ? 'Mi cuenta' : 'Ingresa a tu cuenta'} />
      <main className="min-h-[60vh] bg-paper pb-20 pt-10">
        <div className="mx-auto max-w-7xl px-6">{cuenta ? <MiCuentaView cuenta={cuenta} /> : <LoginCuenta />}</div>
      </main>
      <Footer />
    </>
  );
}
