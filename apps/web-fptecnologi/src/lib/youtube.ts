/*
 * Videos de YouTube: id a partir de cualquier enlace, miniatura y los últimos
 * videos del canal (feed RSS público, sin API key; caché de 1 h).
 */
export type Video = { id: string; titulo: string; fecha?: string };

/** Canal oficial @fptecnologisystem (el id hace falta para el feed RSS). */
export const CANAL_ID = 'UC-PEmoXTNxxlDySxBbJzjGA';
export const CANAL_URL = 'https://www.youtube.com/@fptecnologisystem';

/** Id de 11 caracteres de un enlace watch, youtu.be, shorts, embed o live. */
export function idYoutube(url: string): string | null {
  const u = url.trim();
  if (/^[\w-]{11}$/.test(u)) return u;
  const m = u.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}

export const miniatura = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

/** Enlaces (con título opcional) → videos válidos, sin repetidos. */
export function aVideos(items: { url: string; titulo?: string }[]): Video[] {
  const vistos = new Set<string>();
  const out: Video[] = [];
  for (const it of items) {
    const id = idYoutube(it.url ?? '');
    if (!id || vistos.has(id)) continue;
    vistos.add(id);
    out.push({ id, titulo: it.titulo?.trim() || '' });
  }
  return out;
}

const decodificar = (s: string) =>
  s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

/** Últimos videos publicados en el canal (máx. 15 según YouTube). Vacío si el feed no responde. */
export async function getVideosCanal(limite = 6): Promise<Video[]> {
  try {
    const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${CANAL_ID}`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const xml = await res.text();
    const out: Video[] = [];
    for (const entry of xml.split('<entry>').slice(1)) {
      const id = entry.match(/<yt:videoId>([\w-]{11})<\/yt:videoId>/)?.[1];
      if (!id) continue;
      out.push({
        id,
        titulo: decodificar(entry.match(/<title>([^<]*)<\/title>/)?.[1] ?? ''),
        fecha: entry.match(/<published>([^<]*)<\/published>/)?.[1],
      });
      if (out.length >= limite) break;
    }
    return out;
  } catch {
    return [];
  }
}
