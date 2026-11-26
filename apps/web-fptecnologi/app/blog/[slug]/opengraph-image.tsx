import { readFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { ImageResponse } from 'next/og';
import { fechaLarga, getArticulo, PORTADA_DEFECTO } from '@/lib/blog';

/*
 * Tarjeta que se ve al compartir un artículo (WhatsApp, LinkedIn, Facebook, X):
 * portada de fondo, categoría, título, resumen, autor y fecha, con el logo.
 */
export const alt = 'Artículo del blog de FPTecnologi & System';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/jpeg';

const SITE = process.env.SITE_URL ?? 'https://fptecnologi.com';
const PUBLIC = path.join(process.cwd(), 'public');

/** La portada pasa por sharp: el generador no lee WebP y así pesa poco. Si falla, va la foto por defecto. */
async function portada(url: string | null): Promise<string> {
  const comoDataUri = async (buf: Buffer) =>
    `data:image/jpeg;base64,${(await sharp(buf).resize(1200, 630, { fit: 'cover' }).jpeg({ quality: 78 }).toBuffer()).toString('base64')}`;
  if (url) {
    try {
      const res = await fetch(new URL(url, SITE), { signal: AbortSignal.timeout(6000) });
      if (res.ok) return await comoDataUri(Buffer.from(await res.arrayBuffer()));
    } catch {
      /* sigue con la portada por defecto */
    }
  }
  try {
    return await comoDataUri(await readFile(path.join(PUBLIC, PORTADA_DEFECTO)));
  } catch {
    return ''; // sin foto: queda el fondo azul de marca
  }
}

const recortar = (t: string, max: number) => (t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t);

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = await getArticulo(slug);
  const [fondo, logo, bold, medium] = await Promise.all([
    portada(a?.portadaUrl ?? null),
    readFile(path.join(PUBLIC, 'logo-fptecnologi.svg'), 'base64'),
    readFile(path.join(PUBLIC, 'fonts/Urbanist-Bold.woff')),
    readFile(path.join(PUBLIC, 'fonts/Urbanist-Medium.woff')),
  ]);

  const titulo = recortar(a?.titulo ?? 'Blog de FPTecnologi', 95);
  const largo = titulo.length > 60;
  const resumen = a?.resumen ? recortar(a.resumen, 150) : '';
  const pie = [a?.autorNombre, a ? fechaLarga(a.publicadoEn) : ''].filter(Boolean).join('  ·  ');

  const png = new ImageResponse(
    (
      <div style={{ display: 'flex', width: '100%', height: '100%', position: 'relative', fontFamily: 'Urbanist', color: 'white', background: '#0d2233' }}>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        {fondo && <img src={fondo} width={1200} height={630} style={{ position: 'absolute', top: 0, left: 0, objectFit: 'cover' }} />}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            display: 'flex',
            backgroundImage: 'linear-gradient(100deg, rgba(13,34,51,0.95) 0%, rgba(13,34,51,0.84) 52%, rgba(14,56,88,0.42) 100%)',
          }}
        />
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 14, display: 'flex', background: '#2898ee' }} />

        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%', padding: '54px 72px 50px 80px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', background: 'white', borderRadius: 16, padding: '14px 22px' }}>
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img src={`data:image/svg+xml;base64,${logo}`} width={250} height={59} />
            </div>
            <div style={{ display: 'flex', fontSize: 24, fontWeight: 500, letterSpacing: 4, color: '#81c4f8' }}>BLOG</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 960 }}>
            {a?.categoria && (
              <div style={{ display: 'flex' }}>
                <div style={{ display: 'flex', background: '#2898ee', borderRadius: 10, padding: '8px 18px', fontSize: 22, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>
                  {a.categoria}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', marginTop: 22, fontSize: largo ? 54 : 66, fontWeight: 700, lineHeight: 1.08 }}>{titulo}</div>
            {resumen && <div style={{ display: 'flex', marginTop: 20, fontSize: 26, fontWeight: 500, lineHeight: 1.35, color: 'rgba(255,255,255,0.78)' }}>{resumen}</div>}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 24, fontWeight: 500, color: 'rgba(255,255,255,0.85)' }}>
            <div style={{ display: 'flex' }}>{pie}</div>
            <div style={{ display: 'flex', fontWeight: 700, color: 'white' }}>{new URL(SITE).host.replace(/^www\./, '')}</div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Urbanist', data: bold, weight: 700, style: 'normal' },
        { name: 'Urbanist', data: medium, weight: 500, style: 'normal' },
      ],
    },
  );
  // El PNG con foto pesa ~1,3 MB y WhatsApp descarta las vistas previas pesadas: se entrega en JPEG (~150 KB).
  const jpeg = await sharp(Buffer.from(await png.arrayBuffer())).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  return new Response(new Uint8Array(jpeg), {
    headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' },
  });
}
