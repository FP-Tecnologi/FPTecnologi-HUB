import { cookies } from 'next/headers';
import { COOKIE_CUENTA } from '@/lib/cuenta';

/* Cierra la sesión de Mi cuenta (borra la cookie). */
export async function POST() {
  (await cookies()).delete(COOKIE_CUENTA);
  return Response.json({ ok: true });
}
