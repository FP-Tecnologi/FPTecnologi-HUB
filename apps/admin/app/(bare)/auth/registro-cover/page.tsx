import { redirect } from 'next/navigation';

// El registro abierto está desactivado: las cuentas nuevas entran por invitación del administrador.
export default function Page() {
  redirect('/auth/iniciar-sesion');
}
