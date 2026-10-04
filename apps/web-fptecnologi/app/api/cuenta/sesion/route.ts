import { cookies } from 'next/headers';
import { COOKIE_CUENTA, getResumenCuenta } from '@/lib/cuenta';

/* Quién tiene la sesión de «Mi cuenta» (para el avatar del encabezado). La cookie es httpOnly, así que el
   navegador no la lee: se pregunta aquí. Solo devuelve nombre y correo; nunca el token. */
export const dynamic = 'force-dynamic';

export async function GET() {
  const token = (await cookies()).get(COOKIE_CUENTA)?.value;
  const cuenta = await getResumenCuenta(token);
  return Response.json({ sesion: cuenta ? { nombre: cuenta.nombre, email: cuenta.email } : null });
}
