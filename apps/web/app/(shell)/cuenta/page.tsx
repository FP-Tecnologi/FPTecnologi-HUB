import { redirect } from 'next/navigation';

/* /cuenta quedó absorbida por /perfil (grupo Mi cuenta): redirige para no
   romper marcadores. */
export default function CuentaRedirect() {
  redirect('/perfil');
}
