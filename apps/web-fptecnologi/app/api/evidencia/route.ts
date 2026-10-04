/*
 * Evidencia de un ticket de soporte -> API central (POST /public/uploads/evidencia).
 * Imágenes o PDF (la API valida el tipo real y el peso). El navegador no habla directo
 * con la API: el marcaId lo pone el servidor y la IP real viaja en x-forwarded-for.
 */
const API_URL = process.env.HUB_API_URL ?? 'http://localhost:3001';
const MARCA_ID = process.env.HUB_MARCA_ID ?? '';

export async function POST(req: Request) {
  if (!MARCA_ID) return Response.json({ error: 'Subida no configurada' }, { status: 503 });

  let archivo: FormDataEntryValue | null;
  try {
    archivo = (await req.formData()).get('archivo');
  } catch {
    return Response.json({ error: 'Solicitud inválida' }, { status: 400 });
  }
  if (!(archivo instanceof File) || archivo.size === 0) return Response.json({ error: 'Elige un archivo' }, { status: 400 });

  const form = new FormData();
  form.append('archivo', archivo, archivo.name);
  try {
    const res = await fetch(`${API_URL}/public/uploads/evidencia?marcaId=${encodeURIComponent(MARCA_ID)}`, {
      method: 'POST',
      headers: { 'x-forwarded-for': req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '' },
      body: form,
      cache: 'no-store',
    });
    const j = (await res.json().catch(() => null)) as { data?: { url?: string }; message?: string | string[] } | null;
    if (!res.ok || !j?.data?.url) {
      const msg = Array.isArray(j?.message) ? j.message.join(', ') : j?.message;
      return Response.json({ error: msg || 'No pudimos subir el archivo. Inténtalo de nuevo.' }, { status: res.status || 502 });
    }
    return Response.json({ success: true, url: j.data.url });
  } catch {
    return Response.json({ error: 'No pudimos conectarnos. Inténtalo de nuevo.' }, { status: 502 });
  }
}
