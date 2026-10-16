import { redirect } from 'next/navigation';

/** «Tarjetas del equipo» ahora es la pestaña Equipo de Mi cuenta → Tarjeta digital. */
export default function Page() {
  redirect('/mi-tarjeta');
}
